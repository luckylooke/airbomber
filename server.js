var express = require("express");
var app = express();
var server = require("http").Server(app),
    fs = require('fs'),
    path = require('path');

app.use(express.static(path.join( __dirname, 'public')));

app.get('/', function (req, res) {
    res.sendfile(__dirname + '/index.html');
});

socket = require("socket.io").listen(server);
TILE_SIZE = 35;

var Player = require("./entity/player");
var Bomb = require("./entity/bomb");
var Map = require("./entity/map");
var MapInfo = require("./common/map_info");
var Game = require("./entity/game");
var Lobby = require("./lobby");
var PendingGame = require("./entity/pending_game");
var PowerupIDs = require("./common/powerup_ids");

var games = {};

var updateInterval = 100;
app.use(express.static("client"));
server.listen(process.env.PORT || 3000);

init();

function init() {
    Lobby.initialize();
    setEventHandlers();
    setInterval(broadcastingLoop, updateInterval);
};

function setEventHandlers () {
    socket.sockets.on("connection", function(client) {
        console.log("New player has connected: " + client.id);
        client.on("move player", onMovePlayer);
        client.on("disconnect", onClientDisconnect);
        client.on("place bomb", onPlaceBomb);
        client.on("register map", onRegisterMap);
        client.on("start game on server", onStartGame);
        client.on("ready for round", onReadyForRound);
        client.on("powerup overlap", onPowerupOverlap);
        client.on("enter lobby", Lobby.onEnterLobby);
        client.on("host game", Lobby.onHostGame);
        client.on("select stage", Lobby.onStageSelect);
        client.on("enter pending game", Lobby.onEnterPendingGame);
        client.on("leave pending game", Lobby.onLeavePendingGame);
    });
};

function onClientDisconnect() {
    if (this.gameId == null) {
        return;
    }
    var lobbySlots = Lobby.getLobbySlots();
    if (lobbySlots.state == "joinable" || lobbySlots.state == "full") {
        Lobby.onLeavePendingGame.call(this);
    } else if (lobbySlots.state == "settingup") {
        lobbySlots.state = "empty";
        Lobby.broadcastSlotStateUpdate(this.gameId, "empty");
    } else if (games && lobbySlots.state == "inprogress") {
        if (this.id in games.players) {
            delete games.players[this.id];
            socket.sockets.in(this.gameId).emit("remove player", {id: this.id});
        }
        // temporarely disabled for developement
        // if (games && games.numPlayers < 2) {
        if (games && games.numPlayers < 1) {
            // if (games.numPlayers == 1) {
            //     socket.sockets.in(this.gameId).emit("no opponents left");
            // }
            terminateExistingGame(this.gameId);
        }
        if (games && games.awaiting && games.numEndOfRoundAcknowledgements >= games.numPlayers) {
            games.awaiting = false;
        }
    }
};

function terminateExistingGame(gameId) {
    games.clearBombs();
    games = undefined;
    Lobby.restartLobby();
    Lobby.broadcastSlotStateUpdate(gameId, "empty");
};

function onStartGame() {
    var lobbySlots = Lobby.getLobbySlots();
    var game = new Game(this.gameId);
    games = game;
    var pendingGame = lobbySlots;
    lobbySlots.state = "inprogress";
    Lobby.broadcastSlotStateUpdate(this.gameId, "inprogress");
    var ids = pendingGame.getPlayerIds();
    for(var i = 0; i < ids.length; i++) {
        var playerId = ids[i];
        var spawnPoint = MapInfo['First'].spawnLocations[i];
        var newPlayer = new Player(spawnPoint.x * TILE_SIZE, spawnPoint.y * TILE_SIZE, "down", playerId, pendingGame.players[playerId].color);
        newPlayer.spawnPoint = spawnPoint;
        games.players[playerId] = newPlayer;
    }
    games.numPlayersAlive = ids.length;
    socket.sockets.in(this.gameId).emit("start game on client", {mapName: pendingGame.mapName, players: games.players});
};

function onRegisterMap(data) {
    games.map = new Map(data, TILE_SIZE);
};

function onMovePlayer(data) {
    if (games === undefined || games.awaiting) {
        return;
    }
    var movingPlayer = games.players[this.id];
    if(!movingPlayer) {
        return;
    }
    movingPlayer.x = data.x;
    movingPlayer.y = data.y;
    movingPlayer.facing = data.facing;
};

function onPlaceBomb(data) {
    var player = games.players[this.id];
    if (games === undefined || games.awaiting || player.numBombsAlive >= player.bombCapacity) {
        return;
    }
    var gameId = this.gameId;
    var bombId = data.id;
    var normalizedBombLocation = games.map.placeBombOnGrid(data.x, data.y);
    if(normalizedBombLocation == -1) {
        return;
    }
    player.numBombsAlive++;
    var bombTimeoutId = setTimeout(function() {
        var explosionData = bomb.detonate(games.map, player.bombStrength, games.players);
        player.numBombsAlive--;
        socket.sockets.in(gameId).emit("detonate", {explosions: explosionData.explosions, id: bombId,
            destroyedTiles: explosionData.destroyedBlocks});
        delete games.bombs[bombId];
        games.map.removeBombFromGrid(data.x, data.y);

        handlePlayerDeath(explosionData.killedPlayers, gameId);
    }, 2000);
    var bomb = new Bomb(normalizedBombLocation.x, normalizedBombLocation.y, bombTimeoutId);
    games.bombs[bombId] = bomb;
    socket.sockets.to(this.gameId).emit("place bomb", {x: normalizedBombLocation.x, y: normalizedBombLocation.y, id: data.id});
};

function onPowerupOverlap(data) {
    var powerup = games.map.claimPowerup(data.x, data.y);

    if(!powerup) {
        return;
    }
    var player = games.players[this.id];
    if(powerup.powerupType === PowerupIDs.BOMB_STRENGTH) {
        player.bombStrength++;
    } else if(powerup.powerupType === PowerupIDs.BOMB_CAPACITY) {
        player.bombCapacity++;
    }
    socket.sockets.in(this.gameId).emit("powerup acquired", {acquiringPlayerId: this.id, powerupId: powerup.id, powerupType: powerup.powerupType});
};

function handlePlayerDeath(deadPlayerIds, gameId) {
    var tiedWinnerIds;
    if (deadPlayerIds.length > 1 && games.numPlayersAlive - deadPlayerIds.length == 0) {
        tiedWinnerIds = deadPlayerIds;
    }
    deadPlayerIds.forEach(function(deadPlayerId) {
        games.players[deadPlayerId].alive = false;
        socket.sockets.in(gameId).emit("kill player", {id: deadPlayerId});
        games.numPlayersAlive--;
    }, this);

// temporary for developement
    // if (games.numPlayersAlive <= 1) {
        // endRound(gameId, tiedWinnerIds);
    // }
};

function endRound(gameId, tiedWinnerIds) {
    var roundWinnerColors = [];
    if(tiedWinnerIds) {
        tiedWinnerIds.forEach(function(tiedWinnerId) {
            roundWinnerColors.push(games.players[tiedWinnerId].color);
        });
    } else {
        var winner = games.calculateRoundWinner();
        winner.wins++;
        roundWinnerColors.push(winner.color);
    }
    games.currentRound++;
    if (games.currentRound > 2) {
        var gameWinners = games.calculateGameWinners();

        if (gameWinners.length == 1 && (games.currentRound > 3 || gameWinners[0].wins == 2)) {
            socket.sockets.in(gameId).emit("end game", {
                completedRoundNumber: games.currentRound - 1, roundWinnerColors: roundWinnerColors,
                gameWinnerColor: gameWinners[0].color});
            terminateExistingGame(gameId);
            return;
        }
    }
    games.awaiting = true;
    games.resetForNewRound();
    socket.sockets.in(gameId).emit("new round", {
        completedRoundNumber: games.currentRound - 1,
        roundWinnerColors: roundWinnerColors
    });
};

function onReadyForRound() {
    if (!games.awaiting) {
        return;
    }
    games.addPlayerReadyRound(this.id);
    if (games.numPlayersReadyRound >= games.numPlayers) {
        games.awaiting = false;
    }
};

function broadcastingLoop() {
    for (var i in games.players) {
        var player = games.players[i];
        if (player.alive) {
            socket.sockets.in(games.id).emit("move player", {
                id: player.id,
                x: player.x,
                y: player.y,
                facing: player.facing,
                timestamp: (+new Date())
            });
        }
    }
};