var express = require("express");
var app = express();
var http = require("http"),
    // fs = require('fs'),
    path = require('path');

app.set('port', process.env.OPENSHIFT_NODEJS_PORT || process.env.PORT || 3000);
app.set('ip', process.env.OPENSHIFT_NODEJS_IP || process.env.IP || "127.0.0.1");

var server = http.Server(app);
server.listen(app.get('port') ,app.get('ip'), function () {
    console.log("✔ Express server listening at %s:%d ", app.get('ip'),app.get('port'));
});

app.use(express.static(path.join( __dirname, 'public')));

app.get('/', function (req, res) {
    res.sendFile(__dirname + '/screen.html');
});

var io = require("socket.io").listen(server);
var TILE_SIZE = 35;

var games = {};

var Timer = require("./util/timer");
var Player = require("./entity/player_s");
var Bomb = require("./entity/bomb_s");
var Map = require("./entity/map_s");
var MapInfo = require("./public/src/game/common/map_info");
var lobby = require("./entity/lobby_s")(games);
var PowerupIDs = require("./public/src/game/common/powerup_ids");


var UPDATE_INTERVAL = 100;

lobby.initialize();
setEventHandlers();
setInterval(broadcastingLoop, UPDATE_INTERVAL);


function setEventHandlers () {
    io.on("connection", function(socket) {
        // socket === client === screen !!!
        console.log("New screen has connected: " + socket.id);
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
        socket.on("pause game", onPauseGame);
        socket.on("resume game", onResumeGame);
    });
}

function onSocketDisconnect() {
    console.log('Screen has disconected: ' + this.screenId);
    var game = games[this.gameId];
    if(!game){
        return;
    }
    console.log(game.state);
    if (game.state == "joinable" || game.state == "full") {
        lobby.onLeavePendingGame.call(this, {screenId: this.screenId, gameId: this.gameId});
    } else if (game.state == "settingup") {
        lobby.removeGame(this, this.screenId);
    } else if (game.state == "inprogress") {
        var screen = game.screens[this.screenId];
        for(var nick in screen.players){
            if (nick in game.players) {
                delete game.players[nick];
                io.in(this.gameId).emit("remove player", {nick: nick});
            }
        }
        
        // MAY BE DISSABLED FOR DEVELOPEMENT
        if (game && game.numPlayers < 2) {
            if (game.numPlayers == 1) {
                io.in(this.gameId).emit("no opponents left");
            }
            terminateExistingGame(this);
        }
        
        if (game && game.paused && game.numEndOfRoundAcknowledgements >= game.numPlayers) {
            game.paused = false;
        }
    }
}

function terminateExistingGame(socket) {
    var gameId = socket.gameId;
    games[gameId].clearBombs();
    delete games[gameId];
    lobby.removeGame(socket, gameId);
}

function onStartGame(data) {
    var game = games[data.gameId];
    
    this.gameId = data.gameId;
    games[data.gameId] = game;
    game.state = "inprogress";
    lobby.broadcastGameStateUpdate(this);
    
    var nicks = game.getPlayersNicks();
    for(var i = 0; i < nicks.length; i++) {
        var nick = nicks[i];
        var spawnPoint = MapInfo[game.tilemapName].spawnLocations[i];
        var newPlayer = new Player(spawnPoint.x * TILE_SIZE, spawnPoint.y * TILE_SIZE, "down", nick, game.players[nick].color);
        newPlayer.spawnPoint = spawnPoint;
        newPlayer.controller = game.players[nick].controller;
        game.players[nick] = newPlayer;
    }
    game.numPlayersAlive = nicks.length;
    io.in(data.gameId).emit("start game on client", {tilemapName: game.tilemapName, players: game.players});
}

function onRegisterMap(data) {
    games[this.gameId].map = new Map(data, TILE_SIZE);
}

function onMovePlayer(clientPlayer) {
    var game = games[this.gameId];
    if (game === undefined || game.paused) {
        return;
    }
    var serverPlayer = game.players[clientPlayer.nick];
    if(!serverPlayer) {
        return;
    }
    serverPlayer.x = clientPlayer.x;
    serverPlayer.y = clientPlayer.y;
    serverPlayer.facing = clientPlayer.facing;
}

function onPlaceBomb(data) {
    var socket = this;
    var gameId = this.gameId;
    var game = games[gameId];
    if(!game || game.paused){
        return;
    }
    var player = game.players[data.nick];
    if (player.numBombsAlive >= player.bombCapacity) {
        return;
    }
    var bombId = data.id;
    var normalizedBombLocation = game.map.placeBombOnGrid(data.x, data.y);
    if(normalizedBombLocation == -1) {
        return;
    }
    player.numBombsAlive++;
    var bombTimer = new Timer(function() {
        var explosionData = bomb.detonate(game.map, player.bombStrength, game.players);
        player.numBombsAlive--;
        io.in(gameId).emit("detonate", {explosions: explosionData.explosions, id: bombId,
            destroyedTiles: explosionData.destroyedBlocks});
        delete game.bombs[bombId];
        game.map.removeBombFromGrid(data.x, data.y);

        handlePlayerDeath(explosionData.killedPlayers, socket);
    }, 2000);
    var bomb = new Bomb(normalizedBombLocation.x, normalizedBombLocation.y, bombTimer, TILE_SIZE);
    game.bombs[bombId] = bomb;
    io.in(gameId).emit("place bomb", {x: normalizedBombLocation.x, y: normalizedBombLocation.y, id: data.id});
}

function onPowerupOverlap(data) {
    var game = games[this.gameId];
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
    io.in(this.gameId).emit("powerup acquired", {acquiringPlayerId: player.nick, powerupId: powerup.id, powerupType: powerup.powerupType});
}

function handlePlayerDeath(deadPlayerNicks, socket) {
    var gameId = socket.gameId;
    var game = games[gameId];
    var tiedWinnerNicks;
    if (deadPlayerNicks.length > 1 && game.numPlayersAlive - deadPlayerNicks.length == 0) {
        tiedWinnerNicks = deadPlayerNicks;
    }
    deadPlayerNicks.forEach(function(deadPlayerId) {
        game.players[deadPlayerId].alive = false;
        io.in(gameId).emit("kill player", {nick: deadPlayerId});
        game.numPlayersAlive--;
    }, this);

    // MAY BE DISSABLED FOR DEVELOPEMENT
    if (game.numPlayersAlive <= 1) {
        endRound(tiedWinnerNicks, socket);
    }
}

function endRound(tiedWinnerIds, socket) {
    var gameId = socket.gameId;
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
            io.in(gameId).emit("end game", {
                completedRoundNumber: game.currentRound - 1, roundWinnerColors: roundWinnerColors,
                gameWinnerColor: gameWinners[0].color});
            terminateExistingGame(socket);
            return;
        }
    }
    game.paused = true;
    game.resetForNewRound();
    io.in(gameId).emit("new round", {
        completedRoundNumber: game.currentRound - 1,
        roundWinnerColors: roundWinnerColors
    });
}

function onReadyForRound() {
    var game = games[this.gameId];
    var screen = game.screens[this.screenId];
    if (!game.paused) {
        return;
    }
    game.addPlayerReadyRound(screen.players);
    if (game.numPlayersReadyRound >= game.numPlayers) {
        game.paused = false;
    }
}

function onPauseGame() {
    var game = games[this.gameId];
    game.paused = true;
    for(var bombId in game.bombs){
        game.bombs[bombId].pause();
    }
    io.in(this.gameId).emit("pause game");
}

function onResumeGame() {
    var game = games[this.gameId];
    game.paused = false;
    for(var bombId in game.bombs){
        game.bombs[bombId].resume();
    }
    io.in(this.gameId).emit("resume game");
}

function broadcastingLoop() {
    for (var gameId in games) {
        var game = games[gameId];
        if (game) {
            for (var nick in game.players) {
                var player = game.players[nick];
                if (player.alive) {
                    io.in(gameId).emit("move player", {
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
}