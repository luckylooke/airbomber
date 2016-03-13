/* global bomberman */
var game = bomberman.game;
var socket = bomberman.socket;
var Lobby = function() {};

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
        socket.on("update slots", this.updateSlots.bind(this));
		socket.emit("enter lobby");
	},

	update: function() {
	},

	updateSlots: function(slots) {
		var htmlSlotsElm = document.getElementById('slots');
		var htmlSlotElm = htmlSlotsElm.children[0].cloneNode(true);
		htmlSlotsElm.innerHTML = '';
		
		var names = Object.keys(slots);
        for (var i = 0; i < names.length; i++) {
        	var slot = slots[names[i]];
	        var settings = this.stateSettings[slot.state];
	        var callback = (function (gameId) {
	            return function(){
	            	if (settings.callback != null){
	                	settings.callback(gameId);
	                	document.getElementById('lobby').classList.add("hidden");
	            	}
	            };
	        })(names[i]);
        	
        	var newSlotElm = htmlSlotElm.cloneNode(true);
        	newSlotElm.innerHTML = settings.text + (slot.numOfPlayers ? "(" + slot.numOfPlayers +")" : "");
        	newSlotElm.addEventListener("click", callback);
        	htmlSlotsElm.appendChild(newSlotElm);
        }
	},

	hostGameAction: function() {
		socket.emit("host game", {gameId: socket.id});
		socket.removeAllListeners();
      	bomberman.acTools.currentView = 'StageSelect';
        game.state.start("StageSelect", true, false);
	},

	joinGameAction: function(gameId) {
		socket.removeAllListeners();
      	bomberman.acTools.currentView = 'pending';
        game.state.start("PendingGame", true, false, null, gameId);
	}
};