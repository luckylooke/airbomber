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
var lobby = require("./lobby_s");
var PendingGame = require("./entity/pending_game_s");
var PowerupIDs = require("./common/powerup_ids");

var games = {};

var updateInterval = 100;
app.use(express.static("client"));
server.listen(process.env.PORT || 3000);

lobby.initialize();
setEventHandlers();
setInterval(broadcastingLoop, updateInterval);


function setEventHandlers () {
    socket.sockets.on("connection", function(client) {
        console.log("New screen has connected: " + client.id);
        client.on("move player", onMovePlayer);
        client.on("disconnect", onClientDisconnect);
        client.on("place bomb", onPlaceBomb);
        client.on("register map", onRegisterMap);
        client.on("start game on server", onStartGame);
        client.on("ready for round", onReadyForRound);
        client.on("powerup overlap", onPowerupOverlap);
        client.on("enter lobby", lobby.onEnterlobby);
        client.on("host game", lobby.onHostGame);
        client.on("select stage", lobby.onStageSelect);
        client.on("enter pending game", lobby.onEnterPendingGame);
        client.on("player enter pending game", lobby.onPlayerEnterPendingGame);
        client.on("leave pending game", lobby.onLeavePendingGame);
    });
};

function onClientDisconnect() {
    console.log('Screen has disconected: ' + this.id);
    var lobbySlot = lobby.getlobbySlots()[this.id];
    if(!lobbySlot){
        return;
    }
    if (lobbySlot.state == "joinable" || lobbySlot.state == "full") {
        lobby.onLeavePendingGame.call(this);
    } else if (lobbySlot.state == "settingup") {
        lobbySlot.state = "empty";
        lobby.broadcastSlotStateUpdate(this.id, "empty");
    } else if (games[this.id] && lobbySlot.state == "inprogress") {
        var game = games[this.id];
        if (this.id in game.players) {
            delete game.players[this.id];
            socket.sockets.in(this.id).emit("remove player", {id: this.id});
        }
        // temporarely disabled for developement
        // if (game && game.numPlayers < 2) {
        if (game && game.numPlayers < 1) {
            // if (games.numPlayers == 1) {
            //     socket.sockets.in(this.gameId).emit("no opponents left");
            // }
            terminateExistingGame(this.id);
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
    games.map = new Map(data, TILE_SIZE);
};

function onMovePlayer(clientPlayer) {
    var game = games[this.id];
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
    var game = games[this.id];
    var player = game.players[data.nick];
    if (game === undefined || game.awaiting || player.numBombsAlive >= player.bombCapacity) {
        return;
    }
    var gameId = this.gameId;
    var bombId = data.id;
    var normalizedBombLocation = game.map.placeBombOnGrid(data.x, data.y);
    if(normalizedBombLocation == -1) {
        return;
    }
    player.numBombsAlive++;
    var bombTimeoutId = setTimeout(function() {
        var explosionData = bomb.detonate(game.map, player.bombStrength, game.players);
        player.numBombsAlive--;
        socket.sockets.in(gameId).emit("detonate", {explosions: explosionData.explosions, id: bombId,
            destroyedTiles: explosionData.destroyedBlocks});
        delete game.bombs[bombId];
        game.map.removeBombFromGrid(data.x, data.y);

        handlePlayerDeath(explosionData.killedPlayers, gameId);
    }, 2000);
    var bomb = new Bomb(normalizedBombLocation.x, normalizedBombLocation.y, bombTimeoutId);
    game.bombs[bombId] = bomb;
    socket.sockets.to(this.gameId).emit("place bomb", {x: normalizedBombLocation.x, y: normalizedBombLocation.y, id: data.id});
}

function onPowerupOverlap(player) {
    var game = games[this.id];
    var powerup = game.map.claimPowerup(player.x, player.y);

    if(!powerup) {
        return;
    }
    var player = game.players[player.nick];
    if(powerup.powerupType === PowerupIDs.BOMB_STRENGTH) {
        player.bombStrength++;
    } else if(powerup.powerupType === PowerupIDs.BOMB_CAPACITY) {
        player.bombCapacity++;
    }
    socket.sockets.in(this.gameId).emit("powerup acquired", {acquiringPlayerId: player.nick, powerupId: powerup.id, powerupType: powerup.powerupType});
}

function handlePlayerDeath(deadPlayerNicks, gameId) {
    var game = games[gameId];
    var tiedWinnerNicks;
    if (deadPlayerNicks.length > 1 && game.numPlayersAlive - deadPlayerNicks.length == 0) {
        tiedWinnerNicks = deadPlayerNicks;
    }
    deadPlayerNicks.forEach(function(deadPlayerId) {
        game.players[deadPlayerId].alive = false;
        socket.sockets.in(gameId).emit("kill player", {nick: deadPlayerId});
        game.numPlayersAlive--;
    }, this);

// temporary for developement
    // if (games.numPlayersAlive <= 1) {
        // endRound(gameId, tiedWinnerNicks);
    // }
}

function endRound(gameId, tiedWinnerIds) {
    var game = games[gameId];
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
            socket.sockets.in(gameId).emit("end game", {
                completedRoundNumber: game.currentRound - 1, roundWinnerColors: roundWinnerColors,
                gameWinnerColor: gameWinners[0].color});
            terminateExistingGame(gameId);
            return;
        }
    }
    game.awaiting = true;
    game.resetForNewRound();
    socket.sockets.in(gameId).emit("new round", {
        completedRoundNumber: game.currentRound - 1,
        roundWinnerColors: roundWinnerColors
    });
}

function onReadyForRound() {
    var game = games[this.id];
    if (!game.awaiting) {
        return;
    }
    game.addPlayerReadyRound(this.id);
    if (game.numPlayersReadyRound >= game.numPlayers) {
        game.awaiting = false;
    }
}

function broadcastingLoop() {
    for (var i in games) {
        var game = games[i];
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
};