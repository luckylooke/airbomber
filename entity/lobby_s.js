/* global socket */
var PendingGame = require("./pending_game_s");
var MapInfo = require("./../common/map_info");

var lobbySlots = {};

var lobby = {
    getlobbySlots: function () {
        return lobbySlots;
    },

    restartlobby: function(slotId){
        lobbySlots[slotId] = new PendingGame();
    },

    getNumlobbySlots: function () {
        return Object.keys(this.lobbySlots).length;
    },

    broadcastSlotStateUpdate: function (socketScreen, slotId, newState) {
        socketScreen.emit("update slot", {slotId: slotId, newState: newState});
    },

    initialize: function () {
        lobbySlots['default'] = new PendingGame();
    },

    onEnterlobby: function (data) {
        this.emit("update slots", slotsInfo());
    },

    onHostGame: function (data) {
        console.log(data);
        lobbySlots[data.slotId] = new PendingGame();
        lobbySlots[data.slotId].state = "settingup";
        lobby.broadcastSlotStateUpdate(this, data.slotId, "settingup");
    },

    onStageSelect: function (data) {
        lobbySlots[data.slotId].state = "joinable";
        lobbySlots[data.slotId].mapName = data.mapName;
        lobby.broadcastSlotStateUpdate(this, data.slotId, lobbySlots[data.slotId].state);
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
            lobby.broadcastSlotStateUpdate(this, data.slotId, "full");
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
            lobby.broadcastSlotStateUpdate(this, data.slotId, "full");
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
                this.emit("update slot", {slotId: data.slotId, newState: "empty"});
            }
            if (lobbySlot.state == "full") {
                lobbySlot.state = "joinable";
                this.emit("update slot", {slotId: data.slotId, newState: "joinable"});
            }
        }
    }
};

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
