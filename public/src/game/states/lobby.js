/* global bomberman */
var game = bomberman.game;
var socket = bomberman.socket;
var Lobby = function() {};

// var TextConfigurer = require('../util/text_configurer');

// var initialSlotYOffset = 350;
// var slotXOffset = 155;
// var lobbySlotDistance = 65;
// var textXOffset = 260;
// var textYOffset = 25;

module.exports = Lobby;

Lobby.prototype = {
    init: function () {
        document.getElementById('lobby').classList.remove("hidden");
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
        // game.add.sprite(0, 0, 'background');
        // this.backdrop = game.add.image(130, 300, "background_b");
		// this.slots = [];
		// this.labels = [];
		socket.emit("enter lobby");
        socket.on("update slots", this.updateSlots.bind(this));
	},

	update: function() {
	},

	updateSlots: function(slots) {
		var htmlSlotsElm = document.getElementById('slots');
		var htmlSlotElm = htmlSlotsElm.children[0].cloneNode(true);
		htmlSlotsElm.innerHTML = '';
		
		// this.slots.length = 0;
		var names = Object.keys(slots);
        for (var i = 0; i < names.length; i++) {
        	var state = slots[names[i]].state;
	        var settings = this.stateSettings[state];
	        var callback = (function (slotId) {
	            return function(){
	            	if (settings.callback != null)
	                settings.callback(slotId);
	                document.getElementById('lobby').classList.add("hidden");
	            };
	        })(names[i]);
	        // var slotYOffset = initialSlotYOffset + lobbySlotDistance*i;
	        // this.slots.push(game.add.button(slotXOffset, slotYOffset, "game_slot", callback, null, settings.overFrame, settings.outFrame));
	        // var text = game.add.text(slotXOffset + textXOffset, slotYOffset + textYOffset, settings.text);
	        // TextConfigurer.configureText(text, "white", 18);
	        // text.anchor.setTo(.5, .5);
        	// this.labels.push(text);
        	
        	var newSlotElm = htmlSlotElm.cloneNode(true);
        	newSlotElm.innerHTML = settings.text;
        	newSlotElm.addEventListener("click", callback);
        	htmlSlotsElm.appendChild(newSlotElm);
        }
	},

	hostGameAction: function() {
		socket.emit("host game", {slotId: socket.id});
		socket.removeAllListeners();
        game.state.start("StageSelect", true, false);
	},

	joinGameAction: function(slotId) {
		socket.removeAllListeners();
        game.state.start("PendingGame", true, false, null, slotId);
	}
};