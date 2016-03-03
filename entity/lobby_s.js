/* global socket */
var PendingGame = require("./pending_game_s");
var MapInfo = require("./../public/src/game/common/map_info");

var lobbySlots = {};

var lobby = {
    getlobbySlots: function () {
        return lobbySlots;
    },

    removeSlot: function(socket, slotId){
        delete lobbySlots[slotId];
        lobby.broadcastSlotStateUpdate(socket);
    },

    restartlobby: function(data){
        lobbySlots[data.slotId] = new PendingGame();
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
        lobbySlots['default'] = new PendingGame();
    },

    onEnterlobby: function () {
        lobby.broadcastSlotStateUpdate(this);
    },

    onHostGame: function (data) {
        this.slotId = data.slotId;
        lobbySlots[data.slotId] = new PendingGame();
        lobbySlots[data.slotId].state = "settingup";
        lobby.broadcastSlotStateUpdate(this);
    },

    onStageSelect: function (data) {
        lobbySlots[data.slotId].state = "joinable";
        lobbySlots[data.slotId].mapName = data.mapName;
        lobby.broadcastSlotStateUpdate(this);
    },

    onEnterPendingGame: function (data) {
        var pendingGame = lobbySlots[data.slotId];
        pendingGame.addScreen(this.id);
        this.slotId = data.slotId;
        this.join(data.slotId); // join io room
        this.emit("show current players", {players: pendingGame.players});
        this.broadcast.to(data.slotId).emit("screen joined", {id: this.id, color: pendingGame.screens[this.id].color});
        if (pendingGame.getNumScreens() >= MapInfo['First'].spawnLocations.length) {
            pendingGame.state = "full";
            lobby.broadcastSlotStateUpdate(this);
        }
    },

    onPlayerEnterPendingGame: function (data) {
        var pendingGame = lobbySlots[data.slotId];
        if(!pendingGame){
            return;
        }
        pendingGame.addPlayer(data);
        this.emit("show current players", {players: pendingGame.players});
        this.broadcast.to(data.slotId).emit("player joined", {nick: data.nick, color: pendingGame.players[data.nick].color});
        if (pendingGame.getNumScreens() >= MapInfo['First'].spawnLocations.length) {
            pendingGame.state = "full";
            lobby.broadcastSlotStateUpdate(this);
        }
    },

    onLeavePendingGame: function (data) {
        if(!data){
            return;
        }
        var lobbySlot = lobbySlots[data.slotId];
        var numPlayersLeft = lobbySlot.screens[data.screenId].players.length;
        lobbySlot.removeScreen(data.screenId);
        this.emit("players left", {players: lobbySlot.players, numPlayersLeft: numPlayersLeft});
        if(data.slotId === data.screenId){
           delete lobbySlots[data.slotId]; 
        }else{
            if (lobbySlot.getNumPlayers() == 0) {
                lobbySlot.state = "empty";
            }
            if (lobbySlot.state == "full") {
                lobbySlot.state = "joinable";
            }
            lobby.broadcastSlotStateUpdate(this);
        }
    }
};

module.exports = lobby;