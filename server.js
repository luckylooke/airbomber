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
    res.sendFile(__dirname + '/public/screen.html');
});

var io = require("socket.io").listen(server);
var TILE_SIZE = 35;

require("./util/object_assign"); // ES6 object assign polyfill

var Timer = require("./util/timer");
var Player = require("./entity/player_s");
var Bomb = require("./entity/bomb_s");
var Map = require("./entity/map_s");
var MapInfo = require("./public/src/game/common/map_info");
var lobby = require("./entity/lobby_s");
var PowerupIDs = require("./public/src/game/common/powerup_ids");


var UPDATE_INTERVAL = 100;

var games = lobby.initialize();
setEventHandlers();
setInterval(broadcastingLoop, UPDATE_INTERVAL);


function setEventHandlers () {
    io.on("connection", function(socket) {
        // socket === client === screen !!!
        console.log("New screen has connected: " + socket.id);
        socket.on("disconnect", onSocketDisconnect);
        socket.on("screen reconnect", onReconnect);
        socket.on("move player", onMovePlayer);
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
        socket.on("player leave pending game", lobby.onPlayerLeavePendingGame);
        socket.on("update player pending game", lobby.onUpdatePlayerPendingGame);
        socket.on("leave game", lobby.onLeaveGame);
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
        lobby.onLeaveGame.call(this, {screenId: this.screenId, gameId: this.gameId});
    } else if (game.state == "settingup") {
        lobby.removeGame(this, this.screenId);
    } else if (game.state == "inprogress") {
       onPauseGame.call(this, {reason: 'connection' + this.screenId});
       io.in(this.gameId).emit("screen disconnected", {screenId: this.screenId});
    }
}

function disconnectInprogress(){
    var game = games[this.gameId];
     var screen = game.screens[this.screenId];
     
     if(this.gameId === this.screenId){
        var screens = game.screens;
        if(Object.keys(screens).length < 2){
            delete lobby.games[this.gameId]; 
        }else{
            for (var screenId in screens) {
                if(!lobby.games[screenId]){
                    // first available screen game management can be moved to
                    lobby.games[screenId] = lobby.games[this.gameId];
                    delete lobby.games[this.gameId];
                    for(var nick in screen.players){
                        delete game.players[nick];
                        io.in(this.gameId).emit("remove player", {nick: nick});
                    }
                    delete screens[this.screenId];
                    break;
                }
            }
        }
    }
    
    // MAY BE DISSABLED FOR DEVELOPEMENT
    if (game && game.numPlayers < 2) {
        if (game.numPlayers == 1) {
            io.in(this.gameId).emit("no opponents left", game.lastAlivePlayer());
        }
        lobby.removeGame(this, game.id);
    }
    
    if (game && game.paused && game.numEndOfRoundAcknowledgements >= game.numPlayers) {
        game.paused = false;
    }
}

function onStartGame(data) {
    var game = games[data.gameId];
    
    games[data.gameId] = game;
    game.state = "inprogress";
    lobby.broadcastGameStateUpdate(this);
    
    var i = 0;
    for(var nick in game.players) {
        var spawnPoint = MapInfo[game.tilemapName].spawnLocations[i++];
        var newPlayer = new Player(spawnPoint.x * TILE_SIZE, spawnPoint.y * TILE_SIZE, "down", nick, game.players[nick].color);
        newPlayer.spawnPoint = spawnPoint;
        Object.assign(newPlayer, game.players[nick]);
        game.players[nick] = newPlayer;
    }
    game.numPlayersAlive = i;
    io.in(data.gameId).emit("start game on client", {tilemapName: game.tilemapName, players: game.players});
}

function onRegisterMap(data) {
    if(!games[data.gameId] || games[data.gameId].map){
        return;
    }
    games[data.gameId].map = new Map(data, TILE_SIZE);
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
    var normalizedBombLocation = game.map.placeBombOnGrid(data.x, data.y, bombId);
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

        games[gameId].handlePlayersDeath(explosionData.killedPlayers);
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

function onPauseGame(data) {
    if(games[this.gameId]){
        games[this.gameId].pause(data);
    }
}

function onResumeGame(data) {
    if(games[this.gameId]){
        games[this.gameId].resume(data);
    }
}

function onReconnect(data) {
    var game = games[data.gameId];
    if(!game){
       this.emit('screen reconnected');
       return;
    }
    var screen = game.screens[data.screenId];  
    this.join(data.gameId);
    this.gameId = data.gameId;
    this.screenId = data.screenId;
    this.emit('screen reconnected', {
        players: game.players,
        screenPlayers: screen.players,
        tilemapName: game.tilemapName,
        mapData: game.map.mapData,
        placedBombs: game.map.placedBombs
    });
    onResumeGame.call(this, {reason: 'connection' + this.screenId});
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