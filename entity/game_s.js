var DEFAULT_NUM_ROUNDS = 3;

var Game = function (id, screenId) {
	this.state = 'empty',
	this.master = screenId,
    this.id = id;
	this.players = {};
	this.screens = {};
	this.map = false;
	this.bombs = {};
	this.numPlayersAlive = 0;
    this.readyRound = [];
    this.paused = false;
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
			this.bombs[bombId].explosionTimer.clear();
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
		this.map = false;
		this.clearBombs();
		this.resetPlayers();
        this.readyRound = [];
		this.numPlayersAlive = Object.keys(this.players).length;
	},
	
	getScreensIds: function() {
		return Object.keys(this.screens);
	},

	getNumScreens: function() {
		return Object.keys(this.screens).length;
	},

	getNumPlayers: function() {
		return Object.keys(this.players).length;
	},

	pause: function() {
		this.paused = true;
	    for(var bombId in this.bombs){
	        this.bombs[bombId].pause();
	    }
	    this.notifier('pause game');
	},

	resume: function() {
		this.paused = false;
	    for(var bombId in this.bombs){
	        this.bombs[bombId].resume();
	    }
	    this.notifier('resume game');
	},

	removeScreen: function removeScreen(screenId) {
		var screen = this.screens[screenId];
		for(var nick in screen.players){
            this.removePlayer(screenId, nick);
        }
		delete this.screens[screenId];
		this.notifier('remove screen', {screenId: screenId});
	},

	removePlayer: function removePlayer(screenId, nick) {
		delete this.screens[screenId][nick];
		delete this.players[nick];
		this.notifier('remove player', {screenId: screenId, nick: nick});
	},

	addScreen: function addScreen(screenId) {
		var screen = {
			screenId: screenId,
			players: {},
			master: this.master === screenId
		};
		this.screens[screenId] = screen;
		this.notifier('add screen', screen);
	},

	addPlayer: function addPlayer(player) {
		if(!this.screens[player.screenId]){
			return;
		}
		this.screens[player.screenId].players[player.nick] = player;
		this.players[player.nick] = player;
		this.notifier('add player', player);
		return player;
	},

	updatePlayer: function updatePlayer(playerData) {
		if(!this.screens[playerData.screenId]){
			return;
		}
		var player = this.screens[playerData.screenId].players[playerData.nick];
		Object.assign(player, playerData);
		this.notifier('update player', player);
		return player;
	},
	
	notifier: function gameNotifier(message, data){},
	
	asignNotifier: function asignNotifier(notifier){
		if(typeof notifier !== 'function'){
			return;
		}
		this.notifier = notifier;
		return notifier;
	}
};

module.exports = Game;