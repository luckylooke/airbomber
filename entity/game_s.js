var DEFAULT_NUM_ROUNDS = 3;

var Game = function (id) {
	this.state = 'empty',
    this.id = id;
	this.players = {};
	this.screens = {};
	this.map = {};
	this.bombs = {};
	this.numPlayersAlive = 0;
    this.readyRound = [];
    this.awaiting = false;
	this.numRounds = DEFAULT_NUM_ROUNDS;
	this.currentRound = 1;
};

Game.prototype = {
	get numPlayers() {
		return Object.keys(this.players).length;
	},

    get numPlayersReadyRound() {
        return this.readyRound.length;
	},

    addPlayerReadyRound: function (playersReady) {
    	for(var playerId in playersReady){
	        if (this.readyRound.indexOf(playerId) == -1) {
	            this.readyRound.push(playerId);
			}
    	}
	},

	calculateRoundWinner: function() {
		for(var i in this.players) {
			if(this.players[i].alive) {
				return this.players[i];
			}
		}
	},

	calculateGameWinners: function() {
		var winningPlayers = [];
		var maxWinCount = 0;
		for(var i in this.players) {
			if(this.players[i].wins > maxWinCount) {
				winningPlayers = [this.players[i]];
				maxWinCount = this.players[i].wins;
			} else if (this.players[i].wins == maxWinCount) {
				winningPlayers.push(this.players[i]);
			}
		}
		return winningPlayers;
	},

	clearBombs: function() {
		for(var bombId in this.bombs) {
			clearTimeout(this.bombs[bombId].explosionTimerId);
		}
		this.bombs = {};
	},

	resetPlayers: function() {
		for(var i in this.players) {
			var player = this.players[i];
			player.resetForNewRound();
		}
	},

	resetForNewRound: function() {
		this.clearBombs();
		this.resetPlayers();
        this.readyRound = [];
		this.numPlayersAlive = Object.keys(this.players).length;
	},
	
	getScreensIds: function() {
		return Object.keys(this.screens);
	},
	
	getPlayersNicks: function() {
		return Object.keys(this.players);
	},

	getNumScreens: function() {
		return Object.keys(this.screens).length;
	},

	getNumPlayers: function() {
		return Object.keys(this.players).length;
	},

	removeScreen: function(id) {
		delete this.screens[id];
	},

	removePlayer: function(screenId, playerId) {
		delete this.screens[screenId][playerId];
		delete this.players[playerId];
	},

	addScreen: function(id) {
		this.screens[id] = {
			players: {}
		};
	},

	addPlayer: function(player) {
		if(!this.screens[player.screenId]){
			return;
		}
		this.screens[player.screenId].players[player.nick] = player;
		this.players[player.nick] = player;
		return player;
	}
};

module.exports = Game;