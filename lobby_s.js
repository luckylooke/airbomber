/* global socket */
var PendingGame = require("./entity/pending_game_s");
var MapInfo = require("./common/map_info");

var lobbySlots = {};

var lobby = {
    getlobbySlots: function () {
        return lobbySlots;
    },

    restartlobby: function(slotId){
        lobbySlots[slotId] = new PendingGame();
    },

    // getNumlobbySlots: function () {
    //     return numlobbySlots;
    // },

    broadcastSlotStateUpdate: function (slotId, newState) {
        broadcastSlotStateUpdate(slotId, newState);
    },

    initialize: function () {
        lobbySlots['default'] = new PendingGame();
    },

    onEnterlobby: function (data) {
        socket.emit("update slots", slotsInfo());
    },

    onHostGame: function (data) {
        console.log(data);
        lobbySlots[data.slotId] = new PendingGame();
        lobbySlots[data.slotId].state = "settingup";
        broadcastSlotStateUpdate(data.slotId, "settingup");
    },

    onStageSelect: function (data) {
        lobbySlots[data.slotId].state = "joinable";
        lobbySlots[data.slotId].mapName = data.mapName;
        broadcastSlotStateUpdate(data.slotId, lobbySlots[data.slotId].state);
    },

    onEnterPendingGame: function (data) {
        var pendingGame = lobbySlots[data.slotId];
        pendingGame.addScreen(this.id);
        this.slotId = data.slotId;
        this.join(data.slotId); // join socket room
        this.emit("show current players", {players: pendingGame.players});
        this.broadcast.to(data.slotId).emit("screen joined", {id: this.id, color: pendingGame.screens[this.id].color});
        // if (pendingGame.getNumScreens() >= MapInfo['First'].spawnLocations.length) {
        //     pendingGame.state = "full";
        //     broadcastSlotStateUpdate(data.gameId, "full");
        // }
    },

    onPlayerEnterPendingGame: function (data) {
        var pendingGame = lobbySlots[data.slotId];
        if(!pendingGame){
            return;
        }
        pendingGame.addPlayer(data);
        this.emit("show current players", {players: pendingGame.players});
        this.broadcast.to(data.slotId).emit("player joined", {nick: data.nick, color: pendingGame.players[data.nick].color});
        // if (pendingGame.getNumScreens() >= MapInfo['First'].spawnLocations.length) {
        //     pendingGame.state = "full";
        //     broadcastSlotStateUpdate(data.gameId, "full");
        // }
    },

    onLeavePendingGame: function (data) {
        leavePendingGame.call(this, data);
    }
};

function broadcastSlotStateUpdate(slotId, newState) {
    socket.emit("update slot", {slotId: slotId, newState: newState});
}

function leavePendingGame(data) {
    if(!data){
        return;
    }
    var lobbySlot = lobbySlots[data.slotId];
    lobbySlot.removeScreen(data.screenId);
    socket.emit("player left", {players: lobbySlot.players});
    if (lobbySlot.getNumPlayers() == 0) {
        lobbySlot.state = "empty";
        socket.emit("update slot", {slotId: data.slotId, newState: "empty"});
    }
    if (lobbySlot.state == "full") {
        lobbySlot.state = "joinable";
        socket.emit("update slot", {slotId: data.slotId, newState: "joinable"});
    }
}

function slotsInfo() {
    var slots = Object.keys(lobbySlots),
        result = {};
    for (var i = 0; i < slots.length; i++) {
        result[slots[i]] = {
            numOfPlayers:lobbySlots[slots[i]].getNumPlayers(),
            state:lobbySlots[slots[i]].state
        };
    }
    return result;
}

module.exports = lobby;
