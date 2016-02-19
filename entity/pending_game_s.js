var colorIndices = {
	"white": 0,
	"black": 1,
	"blue": 2,
    "green": 3
};

var PendingGame = function() {
	this.players = {};
	this.screens = {};
	this.state = "empty";
	this.mapName = "";
    this.colors = [{colorName: "white", available: true},
    				{colorName: "black", available: true},
    				{colorName: "blue", available: true},
    				{colorName: "green", available: true}];
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
		this.colors[colorIndices[this.screens[id].color]].available = true;
		delete this.screens[id];
	},

	removePlayer: function(screenId, playerId) {
		this.colors[colorIndices[this.screens[screenId][playerId].color]].available = true;
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
		player.color = this.claimFirstAvailableColor();
		this.screens[player.screenId].players[player.nick] = player;
		this.players[player.nick] = player;
		return player;
	},

	claimFirstAvailableColor: function() {
		for(var i = 0; i < this.colors.length; i++) {
			var color = this.colors[i];
			if(color.available) {
				color.available = false;
				return color.colorName;
			}
		}
	}
};

module.exports = PendingGame;