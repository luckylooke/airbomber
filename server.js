/* global socket */
var express = require("express");
var app = express();
var server = require("http").Server(app),
    fs = require('fs'),
    path = require('path');

app.use(express.static(path.join( __dirname, 'public')));

app.get('/', function (req, res) {
    res.sendfile(__dirname + '/index.html');
});

// expose globals socket and TILE_SIZE
socket = require("socket.io").listen(server);
TILE_SIZE = 35;

var Player = require("./entity/player_s");
var Bomb = require("./entity/bomb_s");
var Map = require("./entity/map_s");
var MapInfo = require("./common/map_info");
var Game = require("./entity/game_s");
var lobby = require("./entity/lobby_s");
var PendingGame = require("./entity/pending_game_s");
var PowerupIDs = require("./common/powerup_ids");

var games = {};
var screens = {};

var updateInterval = 100;
app.use(express.static("client"));
server.listen(process.env.PORT || 3000);

lobby.initialize();
setEventHandlers();
setInterval(broadcastingLoop, updateInterval);


function setEventHandlers () {
    socket.sockets.on("connection", function(screen) {
        // screen === client !!!
        console.log("New screen has connected: " + screen.id);
        screen.on("move player", onMovePlayer);
        screen.on("disconnect", onScreenDisconnect);
        screen.on("place bomb", onPlaceBomb);
        screen.on("register map", onRegisterMap);
        screen.on("start game on server", onStartGame);
        screen.on("ready for round", onReadyForRound);
        screen.on("powerup overlap", onPowerupOverlap);
        screen.on("enter lobby", lobby.onEnterlobby);
        screen.on("host game", lobby.onHostGame);
        screen.on("select stage", lobby.onStageSelect);
        screen.on("enter pending game", lobby.onEnterPendingGame);
        screen.on("player enter pending game", lobby.onPlayerEnterPendingGame);
        screen.on("leave pending game", lobby.onLeavePendingGame);
    });
};

function onScreenDisconnect() {
    console.log('Screen has disconected: ' + this.id);
    var lobbySlot = lobby.getlobbySlots()[this.slotId];
    if(!lobbySlot){
        return;
    }
    if (lobbySlot.state == "joinable" || lobbySlot.state == "full") {
        lobby.onLeavePendingGame({screenId: this.id, slotId: this.slotId});
    } else if (this.id === this.slotId && lobbySlot.state == "settingup") {
        lobbySlot.state = "empty";
        lobby.broadcastSlotStateUpdate(this.slotId, "empty");
    } else if (games[this.slotId] && lobbySlot.state == "inprogress") {
        var game = games[this.slotId];
        var screen = lobbySlot.screens[this.id];
        for(var player in screen.players){
            if (player.nick in game.players) {
                delete game.players[player.nick];
                socket.sockets.in(this.slotId).emit("remove player", {nick: player.nick});
            }
        }
        
        // MAY BE DISSABLED FOR DEVELOPEMENT
        if (game && game.numPlayers < 2) {
            if (games[this.slotId].numPlayers == 1) {
                socket.sockets.in(this.id).emit("no opponents left");
            }
            terminateExistingGame(this.slotId);
        }
        
        if (game && game.awaiting && game.numEndOfRoundAcknowledgements >= game.numPlayers) {
            game.awaiting = false;
        }
    }
};

function terminateExistingGame(slotId) {
    games[slotId].clearBombs();
    games[slotId] = undefined;
    lobby.restartlobby(slotId);
    lobby.broadcastSlotStateUpdate(slotId, "empty");
};

function onStartGame(slotId) {
    this.slotId = slotId;
    var lobbySlots = lobby.getlobbySlots();
    var game = new Game(slotId);
    games[slotId] = game;
    var pendingGame = lobbySlots[slotId];
    pendingGame.state = "inprogress";
    lobby.broadcastSlotStateUpdate(slotId, "inprogress");
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
    socket.sockets.in(slotId).emit("start game on client", {mapName: pendingGame.mapName, players: game.players});
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
        socket.sockets.in(slotId).emit("detonate", {explosions: explosionData.explosions, id: bombId,
            destroyedTiles: explosionData.destroyedBlocks});
        delete game.bombs[bombId];
        game.map.removeBombFromGrid(data.x, data.y);

        handlePlayerDeath(explosionData.killedPlayers, slotId);
    }, 2000);
    var bomb = new Bomb(normalizedBombLocation.x, normalizedBombLocation.y, bombTimeoutId);
    game.bombs[bombId] = bomb;
    socket.sockets.to(slotId).emit("place bomb", {x: normalizedBombLocation.x, y: normalizedBombLocation.y, id: data.id});
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
    socket.sockets.in(this.slotId).emit("powerup acquired", {acquiringPlayerId: player.nick, powerupId: powerup.id, powerupType: powerup.powerupType});
}

function handlePlayerDeath(deadPlayerNicks, slotId) {
    var game = games[slotId];
    var tiedWinnerNicks;
    if (deadPlayerNicks.length > 1 && game.numPlayersAlive - deadPlayerNicks.length == 0) {
        tiedWinnerNicks = deadPlayerNicks;
    }
    deadPlayerNicks.forEach(function(deadPlayerId) {
        game.players[deadPlayerId].alive = false;
        socket.sockets.in(slotId).emit("kill player", {nick: deadPlayerId});
        game.numPlayersAlive--;
    }, this);

    // MAY BE DISSABLED FOR DEVELOPEMENT
    if (game.numPlayersAlive <= 1) {
        endRound(tiedWinnerNicks, slotId);
    }
}

function endRound(tiedWinnerIds, slotId) {
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
            socket.sockets.in(slotId).emit("end game", {
                completedRoundNumber: game.currentRound - 1, roundWinnerColors: roundWinnerColors,
                gameWinnerColor: gameWinners[0].color});
            terminateExistingGame(slotId);
            return;
        }
    }
    game.awaiting = true;
    game.resetForNewRound();
    socket.sockets.in(slotId).emit("new round", {
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
                    socket.sockets.in(game.id).emit("move player", {
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