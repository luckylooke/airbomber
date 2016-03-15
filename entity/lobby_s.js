var Game = require("./game_s");
var MapInfo = require("./../public/src/game/common/map_info");

var lobby = {
    removeGame: function(socket, gameId){
        delete lobby.games[gameId];
        lobby.broadcastGameStateUpdate(socket);
    },

    restartlobby: function(data){
        lobby.games[data.gameId] = new Game();
    },

    getNumGames: function () {
        return Object.keys(lobby.games).length;
    },

    broadcastGameStateUpdate: function (socket) {
        var result = {};
        for (var i in lobby.games) {
            result[i] = {
                numOfPlayers:lobby.games[i].getNumPlayers(),
                state:this.games[i].state
            };
        }
        socket.emit("update games", result);
        socket.broadcast.emit("update games", result);
    },

    initialize: function () {
        lobby.games['default'] = new Game();
    },

    onEnterlobby: function () {
        lobby.broadcastGameStateUpdate(this);
    },

    onHostGame: function (data) {
        this.gameId = data.gameId;
        lobby.games[data.gameId] = new Game();
        lobby.games[data.gameId].state = "settingup";
        lobby.broadcastGameStateUpdate(this);
    },

    onStageSelect: function (data) {
        lobby.games[data.gameId].state = "joinable";
        lobby.games[data.gameId].tilemapName = data.tilemapName;
        lobby.broadcastGameStateUpdate(this);
    },

    onEnterPendingGame: function (data) {
        var game = lobby.games[data.gameId];
        game.addScreen(this.id);
        this.gameId = data.gameId;
        this.join(data.gameId); // join io room
        this.emit("show current players", {players: game.players});
        this.broadcast.to(data.gameId).emit("screen joined", {id: this.id, color: game.screens[this.id].color});
        // if (game.getNumScreens() >= MapInfo['First'].spawnLocations.length) {
        //     game.state = "full";
        //     lobby.broadcastGameStateUpdate(this);
        // }
    },

    onPlayerEnterPendingGame: function (data) {
        var game = lobby.games[data.gameId];
        if(!game){
            return;
        }
        game.addPlayer(data);
        this.emit("show current players", {players: game.players});
        this.broadcast.to(data.gameId).emit("player joined", {players: game.players});
        console.log(game.tilemapName);
        if (game.getNumScreens() >= MapInfo[game.tilemapName].spawnLocations.length) {
            game.state = "full";
        }
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
                for (var screen in screens) {
                    if(!lobby.games[screen]){
                        // first available screen game management can be moved to
                        lobby.games[screen] = lobby.games[data.gameId];
                        delete lobby.games[data.gameId];
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

module.exports = function(games){
    lobby.games = games;
    return lobby;
};
