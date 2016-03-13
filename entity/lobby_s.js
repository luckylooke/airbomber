var Game = require("./game_s");
var MapInfo = require("./../public/src/game/common/map_info");

var lobbySlots = {};

var lobby = {
    getlobbySlots: function () {
        return lobbySlots;
    },

    removeSlot: function(socket, gameId){
        delete lobbySlots[gameId];
        lobby.broadcastSlotStateUpdate(socket);
    },

    restartlobby: function(data){
        lobbySlots[data.gameId] = new Game();
    },

    getNumlobbySlots: function () {
        return Object.keys(this.lobbySlots).length;
    },

    broadcastSlotStateUpdate: function (socket) {
        var slots = Object.keys(lobbySlots),
            result = {};
        for (var i = 0; i < slots.length; i++) {
            result[slots[i]] = {
                numOfPlayers:lobbySlots[slots[i]].getNumPlayers(),
                state:lobbySlots[slots[i]].state
            };
        }
        socket.emit("update slots", result);
        socket.broadcast.emit("update slots", result);
    },

    initialize: function () {
        lobbySlots['default'] = new Game();
    },

    onEnterlobby: function () {
        lobby.broadcastSlotStateUpdate(this);
    },

    onHostGame: function (data) {
        this.gameId = data.gameId;
        lobbySlots[data.gameId] = new Game();
        lobbySlots[data.gameId].state = "settingup";
        lobby.broadcastSlotStateUpdate(this);
    },

    onStageSelect: function (data) {
        lobbySlots[data.gameId].state = "joinable";
        lobbySlots[data.gameId].tilemapName = data.tilemapName;
        lobby.broadcastSlotStateUpdate(this);
    },

    onEnterPendingGame: function (data) {
        var game = lobbySlots[data.gameId];
        game.addScreen(this.id);
        this.gameId = data.gameId;
        this.join(data.gameId); // join io room
        this.emit("show current players", {players: game.players});
        this.broadcast.to(data.gameId).emit("screen joined", {id: this.id, color: game.screens[this.id].color});
        // if (game.getNumScreens() >= MapInfo['First'].spawnLocations.length) {
        //     game.state = "full";
        //     lobby.broadcastSlotStateUpdate(this);
        // }
    },

    onPlayerEnterPendingGame: function (data) {
        var game = lobbySlots[data.gameId];
        if(!game){
            return;
        }
        game.addPlayer(data);
        this.emit("show current players", {players: game.players});
        this.broadcast.to(data.gameId).emit("player joined", {players: game.players});
        console.log(game.tilemapName);
        if (game.getNumScreens() >= MapInfo[game.tilemapName].spawnLocations.length) {
            game.state = "full";
            lobby.broadcastSlotStateUpdate(this);
        }
    },

    onLeavePendingGame: function (data) {
        if(!data){
            return;
        }
        var lobbySlot = lobbySlots[data.gameId];
        if(data.gameId === data.screenId){
            var screens = lobbySlot.screens;
            if(screens.length < 2){
                delete lobbySlots[data.gameId]; 
            }else{
                // TODO LOGIC
                // for (var screen in screens) {
                //     screens[screen]
                // }
            }
        }else{
        var numPlayersLeft = lobbySlot.screens[data.screenId].players.length;
        lobbySlot.removeScreen(data.screenId);
            if (lobbySlot.getNumPlayers() == 0) {
                lobbySlot.state = "empty";
            }
            if (lobbySlot.state == "full") {
                lobbySlot.state = "joinable";
            }
            lobby.broadcastSlotStateUpdate(this);
        }
        this.emit("players left", {players: lobbySlot.players, numPlayersLeft: numPlayersLeft});
    }
};

module.exports = lobby;
