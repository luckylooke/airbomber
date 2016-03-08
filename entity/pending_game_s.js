var PendingGame = function() {
	this.players = {};
	this.screens = {};
	this.state = "empty";
};

PendingGame.prototype = {
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

module.exports = PendingGame;