var express = require("express");
var app = express();
var server = require("http").Server(app),
    fs = require('fs'),
    path = require('path');

app.use(express.static(path.join( __dirname, 'public')));

app.get('/', function (req, res) {
    res.sendfile(__dirname + '/index.html');
});

var io = require("socket.io").listen(server);
var TILE_SIZE = 35;

var Player = require("./entity/player_s");
var Bomb = require("./entity/bomb_s");
var Map = require("./entity/map_s");
var MapInfo = require("./public/src/game/common/map_info");
var Game = require("./entity/game_s");
var lobby = require("./entity/lobby_s");
// var PendingGame = require("./entity/pending_game_s");
var PowerupIDs = require("./public/src/game/common/powerup_ids");

var games = {};

var updateInterval = 100;
app.use(express.static("client"));
server.listen(process.env.PORT || 3000);

lobby.initialize();
setEventHandlers();
setInterval(broadcastingLoop, updateInterval);


function setEventHandlers () {
    io.on("connection", function(socket) {
        // socket === client !!!
        console.log("New socket has connected: " + socket.id);
        socket.on("move player", onMovePlayer);
        socket.on("disconnect", onSocketDisconnect);
        socket.on("place bomb", onPlaceBomb);
        socket.on("register map", onRegisterMap);
        socket.on("start game on server", onStartGame);
        socket.on("ready for round", onReadyForRound);
        socket.on("powerup overlap", onPowerupOverlap);
        socket.on("enter lobby", lobby.onEnterlobby);
        socket.on("host game", lobby.onHostGame);
        socket.on("select stage", lobby.onStageSelect);
        socket.on("enter pending game", lobby.onEnterPendingGame);
        socket.on("player enter pending game", lobby.onPlayerEnterPendingGame);
        socket.on("leave pending game", lobby.onLeavePendingGame);
    });
};

function onSocketDisconnect() {
    console.log('Screen has disconected: ' + this.id);
    var lobbySlot = lobby.getlobbySlots()[this.slotId];
    if(!lobbySlot){
        return;
    }
    if (lobbySlot.state == "joinable" || lobbySlot.state == "full") {
        lobby.onLeavePendingGame.call(this, {screenId: this.id, slotId: this.slotId});
    } else if (this.id === this.slotId && lobbySlot.state == "settingup") {
        lobbySlot.state = "empty";
        lobby.broadcastSlotStateUpdate(this, this.slotId, "empty");
    } else if (games[this.slotId] && lobbySlot.state == "inprogress") {
        var game = games[this.slotId];
        var screen = lobbySlot.screens[this.id];
        for(var player in screen.players){
            if (player.nick in game.players) {
                delete game.players[player.nick];
                io.in(this.slotId).emit("remove player", {nick: player.nick});
            }
        }
        
        // MAY BE DISSABLED FOR DEVELOPEMENT
        if (game && game.numPlayers < 2) {
            if (games[this.slotId].numPlayers == 1) {
                io.in(this.id).emit("no opponents left");
            }
            terminateExistingGame(this);
        }
        
        if (game && game.awaiting && game.numEndOfRoundAcknowledgements >= game.numPlayers) {
            game.awaiting = false;
        }
    }
};

function terminateExistingGame(socket) {
    var slotId = socket.slotId;
    games[slotId].clearBombs();
    games[slotId] = undefined;
    lobby.restartlobby(slotId);
    lobby.broadcastSlotStateUpdate(socket, slotId, "empty");
};

function onStartGame(slotId) {
    this.slotId = slotId;
    var lobbySlots = lobby.getlobbySlots();
    var game = new Game(slotId);
    games[slotId] = game;
    var pendingGame = lobbySlots[slotId];
    pendingGame.state = "inprogress";
    lobby.broadcastSlotStateUpdate(this, slotId, "inprogress");
    var nicks = pendingGame.getPlayersNicks();
    for(var i = 0; i < nicks.length; i++) {
        var nick = nicks[i];
        var spawnPoint = MapInfo['First'].spawnLocations[i];
        var newPlayer = new Player(spawnPoint.x * TILE_SIZE, spawnPoint.y * TILE_SIZE, "down", nick, pendingGame.players[nick].color);
        newPlayer.spawnPoint = spawnPoint;
        newPlayer.controller = pendingGame.players[nick].controller;
        game.players[nick] = newPlayer;
    }
    game.numPlayersAlive = nicks.length;
    io.in(slotId).emit("start game on client", {mapName: pendingGame.mapName, players: game.players});
};

function onRegisterMap(data) {
    games[this.slotId].map = new Map(data, TILE_SIZE);
};

function onMovePlayer(clientPlayer) {
    var game = games[this.slotId];
    if (game === undefined || game.awaiting) {
        return;
    }
    var serverPlayer = game.players[clientPlayer.nick];
    if(!serverPlayer) {
        return;
    }
    serverPlayer.x = clientPlayer.x;
    serverPlayer.y = clientPlayer.y;
    serverPlayer.facing = clientPlayer.facing;
};

function onPlaceBomb(data) {
    var socket = this;
    var slotId = this.slotId;
    var game = games[slotId];
    var player = game.players[data.nick];
    if (game === undefined || game.awaiting || player.numBombsAlive >= player.bombCapacity) {
        return;
    }
    var bombId = data.id;
    var normalizedBombLocation = game.map.placeBombOnGrid(data.x, data.y);
    if(normalizedBombLocation == -1) {
        return;
    }
    player.numBombsAlive++;
    var bombTimeoutId = setTimeout(function() {
        var explosionData = bomb.detonate(game.map, player.bombStrength, game.players);
        player.numBombsAlive--;
        io.in(slotId).emit("detonate", {explosions: explosionData.explosions, id: bombId,
            destroyedTiles: explosionData.destroyedBlocks});
        delete game.bombs[bombId];
        game.map.removeBombFromGrid(data.x, data.y);

        handlePlayerDeath(explosionData.killedPlayers, socket);
    }, 2000);
    var bomb = new Bomb(normalizedBombLocation.x, normalizedBombLocation.y, bombTimeoutId, TILE_SIZE);
    game.bombs[bombId] = bomb;
    io.in(slotId).emit("place bomb", {x: normalizedBombLocation.x, y: normalizedBombLocation.y, id: data.id});
}

function onPowerupOverlap(data) {
    var game = games[this.slotId];
    var powerup = game.map.claimPowerup(data.x, data.y);

    if(!powerup) {
        return;
    }
    var player = game.players[data.nick];
    if(powerup.powerupType === PowerupIDs.BOMB_STRENGTH) {
        player.bombStrength++;
    } else if(powerup.powerupType === PowerupIDs.BOMB_CAPACITY) {
        player.bombCapacity++;
    }
    io.in(this.slotId).emit("powerup acquired", {acquiringPlayerId: player.nick, powerupId: powerup.id, powerupType: powerup.powerupType});
}

function handlePlayerDeath(deadPlayerNicks, socket) {
    var slotId = socket.slotId;
    var game = games[slotId];
    var tiedWinnerNicks;
    if (deadPlayerNicks.length > 1 && game.numPlayersAlive - deadPlayerNicks.length == 0) {
        tiedWinnerNicks = deadPlayerNicks;
    }
    deadPlayerNicks.forEach(function(deadPlayerId) {
        game.players[deadPlayerId].alive = false;
        io.in(slotId).emit("kill player", {nick: deadPlayerId});
        game.numPlayersAlive--;
    }, this);

    // MAY BE DISSABLED FOR DEVELOPEMENT
    if (game.numPlayersAlive <= 1) {
        endRound(tiedWinnerNicks, socket);
    }
}

function endRound(tiedWinnerIds, socket) {
    var slotId = socket.slotId;
    var game = games[slotId];
    var roundWinnerColors = [];
    if(tiedWinnerIds) {
        tiedWinnerIds.forEach(function(tiedWinnerId) {
            roundWinnerColors.push(game.players[tiedWinnerId].color);
        });
    } else {
        var winner = game.calculateRoundWinner();
        winner.wins++;
        roundWinnerColors.push(winner.color);
    }
    game.currentRound++;
    if (game.currentRound > 2) {
        var gameWinners = game.calculateGameWinners();

        if (gameWinners.length == 1 && (game.currentRound > 3 || gameWinners[0].wins == 2)) {
            io.in(slotId).emit("end game", {
                completedRoundNumber: game.currentRound - 1, roundWinnerColors: roundWinnerColors,
                gameWinnerColor: gameWinners[0].color});
            terminateExistingGame(socket);
            return;
        }
    }
    game.awaiting = true;
    game.resetForNewRound();
    io.in(slotId).emit("new round", {
        completedRoundNumber: game.currentRound - 1,
        roundWinnerColors: roundWinnerColors
    });
}

function onReadyForRound() {
    var game = games[this.slotId];
    var screen = lobby.getlobbySlots()[this.slotId].screens[this.id];
    if (!game.awaiting) {
        return;
    }
    game.addPlayerReadyRound(screen.players);
    if (game.numPlayersReadyRound >= game.numPlayers) {
        game.awaiting = false;
    }
}

function broadcastingLoop() {
    for (var i in games) {
        var game = games[i];
        if (game) {
            for (var ii in game.players) {
                var player = game.players[ii];
                if (player.alive) {
                    io.in(game.id).emit("move player", {
                        nick: player.nick,
                        x: player.x,
                        y: player.y,
                        facing: player.facing,
                        timestamp: (+new Date())
                    });
                }
                
            }
        }
    }
};