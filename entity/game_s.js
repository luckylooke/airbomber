var DEFAULT_NUM_ROUNDS = 3;

var Game = function (id, screenId) {
	this.state = 'empty',
	this.master = screenId,
    this.id = id;
	this.players = {};
	this.screens = {};
	this.map = {};
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

	pause: function() {
		this.paused = true;
	    for(var bombId in this.bombs){
	        this.bombs[bombId].pause();
	    }
	    this.onPauseGame();
	},

	resume: function() {
		this.paused = false;
	    for(var bombId in this.bombs){
	        this.bombs[bombId].resume();
	    }
	    this.onResumeGame();
	},

	removeScreen: function removeScreen(screenId) {
		var screen = this.screens[screenId];
		for(var nick in screen.players){
            this.removePlayer(screenId, nick);
        }
		delete this.screens[screenId];
		this.onRemoveScreen(screenId);
	},

	removePlayer: function removePlayer(screenId, nick) {
		delete this.screens[screenId][nick];
		delete this.players[nick];
		this.onRemovePlayer(screenId, nick);
	},

	addScreen: function addScreen(screenId) {
		var screen = {
			screenId: screenId,
			players: {}
		};
		this.screens[screenId] = screen;
		this.onAddScreen(screen);
	},

	addPlayer: function addPlayer(player) {
		if(!this.screens[player.screenId]){
			return;
		}
		this.screens[player.screenId].players[player.nick] = player;
		this.players[player.nick] = player;
		this.onAddPlayer(player);
		return player;
	},
	
	onAddPlayer: function onAddPlayer(player){},
	onAddScreen: function onAddScreen(screen){},
	onRemovePlayer: function onRemovePlayer(screenId, playerId){},
	onRemoveScreen: function onRemoveScreen(screenId){},
	onPauseGame: function onPauseGame(){},
	onResumeGame: function onResumeGame(){},
	
	asignNotifier: function asignNotifier(notifier){
		if(typeof notifier !== 'function'){
			return;
		}
		this.onAddPlayer = function notifierOnAddPlayer(player){
			notifier('add player', player);
		};
		this.onAddScreen = function notifierOnAddScreen(screen){
			notifier('add screen', screen);
		};
		this.onRemovePlayer = function notifierOnRemovePlayer(screenId, playerId){
			notifier('remove player', {screenId: screenId, playerId: playerId});
		};
		this.onRemoveScreen = function notifierOnRemoveScreen(screenId){
			notifier('remove screen', {screenId: screenId});
		};
		this.onPauseGame = function notifierOnPauseGame(){
			notifier('pause game');
		};
		this.onResumeGame = function notifierOnResumeGame(){
			notifier('resume game');
		};
		return notifier;
	}
};

module.exports = Game;