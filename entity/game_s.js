var DEFAULT_NUM_ROUNDS = 1;

var Game = function (id, master, cbDestroy) {
	this.state = 'empty',
	this.master = master,
    this.id = id;
	this.players = {};
	this.screens = {};
	this.map = false;
	this.bombs = {};
	this.numPlayersAlive = 0;
    this.readyRound = [];
    this.paused = false;
    this.pauseReasons = {};
	this.numRounds = DEFAULT_NUM_ROUNDS;
	this.currentRound = 1;
	this.onDestroy = cbDestroy;
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

	lastAlivePlayer: function() {
		for(var i in this.players) {
			if(this.players[i].alive){
				return this.players[i];
			}
		}
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
		if(this.getNumPlayers() < 2){
			return;
		}
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

	pause: function(data) {
		if(data && data.reason){
			this.pauseReasons[data.reason] = true;
		}
		if(this.paused){
			return; // already paused by other reason
		}
		this.paused = true;
	    for(var bombId in this.bombs){
	        this.bombs[bombId].pause();
	    }
	    this.notifier('pause game');
	},

	resume: function(data) {
		if(data && data.reason){
			delete this.pauseReasons[data.reason];
		}
		this.paused = false;
	    if(!Object.keys(this.pauseReasons).length){
		    for(var bombId in this.bombs){
		        this.bombs[bombId].resume();
		    }
		    this.notifier('resume game');
	    }
	},
	
	handlePlayersDeath: function(deadPlayerNicks, remove) {
		var tiedWinnerNicks;
	    if (deadPlayerNicks.length > 1 && this.numPlayersAlive - deadPlayerNicks.length == 0) {
	        tiedWinnerNicks = deadPlayerNicks;
	    }
	    deadPlayerNicks.forEach(function(deadPlayerNick) {
	        this.players[deadPlayerNick].alive = false;
	        this.notifier('kill player', {nick: deadPlayerNick});
	        this.numPlayersAlive--;
	    }, this);
	    
	    // MAY BE DISSABLED FOR DEVELOPEMENT
	    if (this.numPlayersAlive <= 1) {
	        this.endRound(tiedWinnerNicks);
	    }
	},
	
	endRound: function(tiedWinnerIds) {
	    var roundWinnerColors = [];
	    if(tiedWinnerIds) {
	        tiedWinnerIds.forEach(function(tiedWinnerId) {
	            roundWinnerColors.push(this.players[tiedWinnerId].color);
	        }, this);
	    } else {
	        var winner = this.calculateRoundWinner();
	        winner.wins++;
	        roundWinnerColors.push(winner.color);
	    }
	    this.currentRound++;
	    if (this.currentRound > 2) {
	        var gameWinners = this.calculateGameWinners();
	
	        if (gameWinners.length == 1 && (this.currentRound > 3 || gameWinners[0].wins == 2)) {
	            this.notifier('end game', {
		            completedRoundNumber: this.currentRound - 1,
		            roundWinnerColors: roundWinnerColors,
		            gameWinner: gameWinners[0]
	            });
			    this.clearBombs();
			    this.onDestroy();
	            return;
	        }
	    }
	    this.paused = true;
	    this.resetForNewRound();
	    this.notifier('new round', {
	        completedRoundNumber: this.currentRound - 1,
	        roundWinnerColors: roundWinnerColors
	    });
	},

	removeScreen: function removeScreen(screenId) {
		var screen = this.screens[screenId];
		for(var nick in screen.players){
            this.removePlayer(screenId, nick);
        }
		this.notifier('remove screen', {screenId: screenId});
	},

	removePlayer: function removePlayer(screenId, nick) {
        if(this.state === 'inprogress'){
        	this.handlePlayersDeath([nick], 'remove');
        }else{
            if (this.getNumPlayers() == 0) {
                this.state = "empty";
            }
            if (this.state == "full") {
                this.state = "joinable";
            }
        }
		delete this.screens[screenId].players[nick];
		if(!this.screens[screenId].players.length){
			delete this.screens[screenId];
		}
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
			this.addScreen(player.screenId);
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
		if(playerData.newNick){
			player.nick = playerData.newNick;
			delete playerData.nick;
			delete playerData.newNick;
		}
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