/* global bomberman */
var game = bomberman.game;
var socket = bomberman.socket;
var Lobby = function() {};

module.exports = Lobby;

Lobby.prototype = {
    init: function () {
        bomberman.vmTools.showWithCbs('lobby');
        bomberman.airconsole.broadcast({listener: 'gameState', gameState: 'lobby'});
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
        socket.on("update games", this.updateGames.bind(this));
		socket.emit("enter lobby");
	},

	update: function() {
	},

	updateGames: function(games) {
		var htmlGamesElm = document.getElementById('slots');
		var htmlGameElm = htmlGamesElm.children[0].cloneNode(true);
		htmlGamesElm.innerHTML = '';
		
		var names = Object.keys(games);
        for (var i = 0; i < names.length; i++) {
        	var game = games[names[i]];
	        var settings = this.stateSettings[game.state];
	        var callback = (function (gameId, sett) {
	            return function(){
	            	if (sett.callback != null){
	                	sett.callback(gameId);
	            	}
	            };
	        })(names[i], settings);
        	
        	var newGameElm = htmlGameElm.cloneNode(true);
        	newGameElm.innerHTML = settings.text + (game.numOfPlayers ? "(" + game.numOfPlayers +")" : "");
        	newGameElm.addEventListener("click", callback);
        	htmlGamesElm.appendChild(newGameElm);
        }
	},

	hostGameAction: function() {
		bomberman.storage.gameId = socket.id;
		bomberman.storage.screenId = socket.id;
		socket.removeAllListeners();
		socket.emit("host game", {gameId: socket.id, screenId: socket.id});
        game.state.start("StageSelect", true, false);
	},

	joinGameAction: function(gameId) {
		bomberman.storage.gameId = gameId;
		bomberman.storage.screenId = socket.id;
		socket.removeAllListeners();
        game.state.start("PendingGame", true, false, null, gameId);
	}
};