var Lobby = function() {};
var TextConfigurer = require('../util/text_configurer');

var initialSlotYOffset = 350;
var slotXOffset = 155;
var lobbySlotDistance = 60;
var textXOffset = 260;
var textYOffset = 25;

module.exports = Lobby;

Lobby.prototype = {
    init: function () {
	},

	create: function() {
		this.stateSettings = {
			empty: {
				outFrame: 0,
				overFrame: 1,
                text: "Host Game ",
				callback: this.hostGameAction
			},
			joinable: {
				outFrame: 2,
				overFrame: 3,
				text: "Join Game ",
				callback: this.joinGameAction
			},
			settingup: {
				outFrame: 4,
				overFrame: 5,
				text: "Game is being set up... ",
				callback: null
			},
			inprogress: {
				outFrame: 4,
				overFrame: 5,
				text: "Game in Progress ",
				callback: null
			},
			full: {
				outFrame: 4,
				overFrame: 5,
				text: "Game Full ",
				callback: null
			}
		};
        game.add.sprite(0, 0, 'background');
        this.backdrop = game.add.image(130, 300, "background_b");
		this.slots = [];
		this.labels = [];
		var gameData = [{state: "empty"}, {state: "empty"}, {state: "joinable"}, {state: "insession"}];
		socket.emit("enter lobby");
        socket.on("add slots", this.addSlots.bind(this));
        socket.on("update slot", this.updateSlot.bind(this));
	},

	update: function() {
	},

	addSlots: function(gameData) {
        var state = gameData.state;
        var settings = this.stateSettings[state];
        callback = function () {
            if (settings.callback != null)
                settings.callback(1);
        };
        var slotYOffset = initialSlotYOffset + lobbySlotDistance;
        this.slots = game.add.button(slotXOffset, slotYOffset, "game_slot", callback, null, settings.overFrame, settings.outFrame);
        var text = game.add.text(slotXOffset + textXOffset, slotYOffset + textYOffset, settings.text);
        TextConfigurer.configureText(text, "white", 18);
        text.anchor.setTo(.5, .5);
        this.labels = text;
	},

	hostGameAction: function(gameId) {
		socket.emit("host game", {gameId: gameId});
		socket.removeAllListeners();
        game.state.start("StageSelect", true, false, gameId);
	},

	joinGameAction: function(gameId) {
		socket.removeAllListeners();
        game.state.start("PendingGame", true, false, null, gameId);
	},

	updateSlot: function(updateInfo) {
		var settings = this.stateSettings[updateInfo.newState];
		var id = updateInfo.gameId;
        var button = this.slots;
        this.labels.setText(settings.text);
		button.setFrames(settings.overFrame, settings.outFrame);
		button.onInputUp.removeAll();
		button.onInputUp.add(function() { return settings.callback(id)}, this);
	}
};