var TextConfigurer = require('../util/text_configurer');

var PendingGame = function() {};

module.exports = PendingGame;

var xOffset = 180;
var yOffset = 25;
var buttonXOffset = 345;
var startGameButtonYOffset = 320;
var leaveButtonYOffset = 370;
var characterSquareStartingX = 345;
var characterSquareStartingY = 80;
var characterSquareXDistance = 105;
var characterSquareYDistance = 100;
var characterOffsetX = 4.5;
var characterOffsetY = 4.5;
var minPlayerMessageOffsetX = 330;
var minPlayerMessageOffsetY = 425;
var numCharacterSquares = 4;

PendingGame.prototype = {
    init: function (tilemapName, gameId) {
		this.tilemapName = tilemapName;
		this.gameId = gameId;
	},

	create: function() {
        game.add.sprite(0, 0, 'background_s');
		socket.emit("enter pending game", {gameId: this.gameId});
		var backdrop = game.add.image(xOffset, yOffset, "pending_game_backdrop");
		this.startGameButton = game.add.button(buttonXOffset, startGameButtonYOffset, "start_game_button", null, this,
			2, 2);
		this.leaveGameButton = game.add.button(buttonXOffset, leaveButtonYOffset, "leave_game_button", this.leaveGameAction, null, 1, 0);
		this.characterSquares = this.drawCharacterSquares(4);
		this.characterImages = [];
		this.numPlayersInGame = 0;
		this.minPlayerMessage = game.add.text(minPlayerMessageOffsetX, minPlayerMessageOffsetY, "Cannot start game without\nat least 2 players.")
		TextConfigurer.configureText(this.minPlayerMessage, "red", 17);
		this.minPlayerMessage.visible = false;
		socket.on("show current players", this.populateCharacterSquares.bind(this));
		socket.on("player joined", this.playerJoined.bind(this));
		socket.on("player left", this.playerLeft.bind(this));
		socket.on("start game on client", this.startGame);
	},

	update: function() {
	},

	drawCharacterSquares: function(numOpenings) {
		var characterSquares = [];
		var yOffset = characterSquareStartingY;
		var xOffset = characterSquareStartingX;
		for(var i = 0; i < numCharacterSquares; i++) {
			var frame = i < numOpenings ? 0 : 1;
			characterSquares[i] = game.add.sprite(xOffset, yOffset, "character_square", frame);
			if(i % 2 == 0) {
				xOffset += characterSquareXDistance;
			} else {
				xOffset = characterSquareStartingX;
				yOffset += characterSquareYDistance;
			}
		}
		return characterSquares;
	},

	populateCharacterSquares: function(data) {
		this.numPlayersInGame = 0;
		for(var playerId in data.players) {
			var color = data.players[playerId].color;
			this.characterImages[playerId] = game.add.image(this.characterSquares[this.numPlayersInGame].position.x + characterOffsetX, 
				this.characterSquares[this.numPlayersInGame].position.y + characterOffsetY, "bomberman_head_" + color);
			this.numPlayersInGame++;
		}
		if(this.numPlayersInGame > 1) {
			this.activateStartGameButton();
		} else {
			this.minPlayerMessage.visible = true;
		}
	},

	playerJoined: function(data) {
		this.numPlayersInGame++;
		var index = this.numPlayersInGame - 1;
		this.characterImages[data.id] = game.add.image(this.characterSquares[index].position.x + characterOffsetX, this.characterSquares[index].position.y + characterOffsetY, "bomberman_head_" +  data.color);
		if(this.numPlayersInGame == 2) {
			this.activateStartGameButton();
		}
	},

	activateStartGameButton: function() {
		this.minPlayerMessage.visible = false;
		this.startGameButton.setFrames(1, 0);
		this.startGameButton.onInputUp.removeAll();
		this.startGameButton.onInputUp.add(this.startGameAction, this);
	},

	deactivateStartGameButton: function() {
		this.minPlayerMessage.visible = true;
		this.startGameButton.setFrames(2, 2);
		this.startGameButton.onInputUp.removeAll();
	},

	playerLeft: function(data) {
		this.numPlayersInGame--;
		if(this.numPlayersInGame == 1) {
			this.deactivateStartGameButton();
		}
		for(var playerId in this.characterImages) {
			this.characterImages[playerId].destroy();
		}
		this.populateCharacterSquares(data);
	},
	startGameAction: function() {
		socket.emit("start game on server");
	},

	leaveGameAction: function() {
		socket.emit("leave pending game");
		socket.removeAllListeners();
        game.state.start("Lobby");
	},

	startGame: function(data) {
		socket.removeAllListeners();
		game.state.start("Level", true, false, data.mapName, data.players, this.id);
	}
};