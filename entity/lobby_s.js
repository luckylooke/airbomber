var Game = require("./game_s");
var MapInfo = require("./../public/src/game/common/map_info");

var lobby = {

    initialize: function () {
        lobby.games = {
            hostSameSlot: new Game('hostSameSlot')
        };
        return lobby.games;
    },
    
    removeGame: function(socket, gameId){
        delete lobby.games[gameId];
        lobby.broadcastGameStateUpdate(socket);
    },

    getNumGames: function () {
        return Object.keys(lobby.games).length;
    },

    broadcastGameStateUpdate: function (socket) {
        var result = {};
        for (var i in lobby.games) {
            var game = lobby.games[i];
            result[i] = {
                numOfPlayers: game.getNumPlayers(),
                state: game.state,
                gameId: game.id,
                tilemapName: game.tilemapName
            };
        }
        socket.emit("update games", result);
        socket.broadcast.emit("update games", result);
    },

    onEnterlobby: function () {
        lobby.broadcastGameStateUpdate(this);
    },

    onHostGame: function (data) {
        this.gameId = data.gameId;
        this.screenId = data.screenId;
        var game = new Game(data.gameId, data.screenId),
            socket = this;
        game.asignNotifier(function(message, data){
            socket.broadcast.to(socket.gameId).emit(message, data);
            socket.emit(message, data);
        });
        game.state = "settingup";
        lobby.games[data.gameId] = game;
        clearInterval('host lobby.games: ', lobby.games);
        lobby.broadcastGameStateUpdate(this);
    },

    onStageSelect: function (data) {
        lobby.games[data.gameId].state = "joinable";
        lobby.games[data.gameId].tilemapName = data.tilemapName;
        lobby.broadcastGameStateUpdate(this);
    },

    onEnterPendingGame: function (data) {
        var game = lobby.games[data.gameId];
        if(!game){
            return;
        }
        game.addScreen(data.screenId);
        this.gameId = data.gameId;
        this.screenId = data.screenId;
        this.join(data.gameId); // join io room
        this.emit("show current players", {players: game.players});
        this.broadcast.to(data.gameId).emit("screen joined", {id: this.screenId});
    },

    onPlayerEnterPendingGame: function (data) {
        var game = lobby.games[data.gameId];
        if(!game){
            return;
        }
        game.addPlayer(data);
        this.emit("show current players", {players: game.players});
        this.broadcast.to(data.gameId).emit("player joined", {players: game.players});
        if (game.getNumScreens() >= MapInfo[game.tilemapName].spawnLocations.length) {
            game.state = "full";
        }
        lobby.broadcastGameStateUpdate(this);
    },

    onUpdatePlayerPendingGame: function (data) {
        var game = lobby.games[data.gameId];
        if(!game){
            return;
        }
        game.updatePlayer(data);
        this.broadcast.to(data.gameId).emit("player joined", {players: game.players});
        this.emit("show current players", {players: game.players});
        lobby.broadcastGameStateUpdate(this);
    },

    onLeavePendingGame: function (data) {
        if(!data){
            return;
        }
        var game = lobby.games[data.gameId];
        if(data.gameId === data.screenId){
            var screens = game.screens;
            if(Object.keys(screens).length < 2){
                delete lobby.games[data.gameId]; 
            }else{
                for (var screenId in screens) {
                    if(!screens[screenId].master){
                        // first available screen, game management can be moved to
                        var screen = screens[screenId];
                        screen.master = true;
                        lobby.games[data.gameId].master = screenId;
                        for(var nick in screen.players){
                            delete game.players[nick];
                            this.to(data.gameId).emit("remove player", {nick: nick});
                        }
                        delete screens[this.screenId];
                        break;
                    }
                }
            }
        }else{
            var numPlayersLeft = game.screens[data.screenId].players.length;
            game.removeScreen(data.screenId);
            if (game.getNumPlayers() == 0) {
                game.state = "empty";
            }
            if (game.state == "full") {
                game.state = "joinable";
            }
        }
        lobby.broadcastGameStateUpdate(this);
        this.emit("players left", {players: game.players, numPlayersLeft: numPlayersLeft});
    }
};

module.exports = lobby;
