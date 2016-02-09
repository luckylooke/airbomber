var PendingGame = require("./entity/pending_game");
var MapInfo = require("./common/map_info");

var lobbySlots = {};
var lobbyId = -1;

var Lobby = {
    getLobbySlots: function () {
        return lobbySlots;
    },

    restartLobby: function(){
        lobbySlots = new PendingGame();
    },

    getLobbyId: function () {
        return lobbyId;
    },

    getNumLobbySlots: function () {
        return numLobbySlots;
    },

    broadcastSlotStateUpdate: function (gameId, newState) {
        broadcastSlotStateUpdate(gameId, newState);
    },

    initialize: function () {
        lobbySlots = new PendingGame();
    },

    onEnterLobby: function (data) {
        this.join(lobbyId);
        socket.sockets.in(lobbyId).emit("add slots", lobbySlots);
    },

    onHostGame: function (data) {
        lobbySlots.state = "settingup";
        this.gameId = data.gameId;
        broadcastSlotStateUpdate(data.gameId, "settingup");
    },

    onStageSelect: function (data) {
        lobbySlots.state = "joinable";
        lobbySlots.mapName = data.mapName;
        broadcastSlotStateUpdate(this.gameId, lobbySlots.state);
    },

    onEnterPendingGame: function (data) {
        var pendingGame = lobbySlots;
        this.leave(lobbyId);
        this.join(data.gameId);
        pendingGame.addPlayer(this.id);
        this.gameId = data.gameId;
        this.emit("show current players", {players: pendingGame.players});
        this.broadcast.to(data.gameId).emit("player joined", {id: this.id, color: pendingGame.players[this.id].color});
        if (pendingGame.getNumPlayers() >= MapInfo['First'].spawnLocations.length) {
            pendingGame.state = "full";
            broadcastSlotStateUpdate(data.gameId, "full");
        }
    },

    onLeavePendingGame: function (data) {
        leavePendingGame.call(this);
    }
};

function broadcastSlotStateUpdate(gameId, newState) {
    socket.sockets.in(lobbyId).emit("update slot", {gameId: gameId, newState: newState});
}

function leavePendingGame() {
    var lobbySlot = lobbySlots;
    this.leave(this.gameId);
    lobbySlot.removePlayer(this.id);
    socket.sockets.in(this.gameId).emit("player left", {players: lobbySlot.players});
    if (lobbySlot.getNumPlayers() == 0) {
        lobbySlot.state = "empty";
        socket.sockets.in(lobbyId).emit("update slot", {gameId: this.gameId, newState: "empty"});
    }
    if (lobbySlot.state == "full") {
        lobbySlot.state = "joinable";
        socket.sockets.in(lobbyId).emit("update slot", {gameId: this.gameId, newState: "joinable"});
    }
}

module.exports = Lobby;
