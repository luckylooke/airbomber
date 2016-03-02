/* global bomberman, AirConsole */
var TextConfigurer = require('../util/text_configurer');
var game = bomberman.game;
var socket = bomberman.socket;
var screen = bomberman.screen;
var MAX_PLAYERS = 4;

screen.isReady = false;
screen.players = {};

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



var airconsole = bomberman.airconsole = new AirConsole();
var acTools = bomberman.acTools = {};

acTools.listeners = {};
acTools.uniListeners = [];
acTools.addListener = function(name, fn){
	if(!fn){
		return;
	}else if(typeof name !== 'string'){
		if(typeof name === 'undefined'){
			acTools.uniListeners.push(fn);
		}
		return;
	}
	acTools.listeners[name] = fn;	
};
acTools.rmListener = function(name, fn){
	if(fn && typeof name === 'undefined'){
		var index = acTools.uniListeners.indexOf(fn);
		acTools.uniListeners.splice(index, 1);
	}else{
		delete acTools.listeners[name];
	}
};
acTools.onMessage = function(device_id, data) {
	if(data.listener && acTools.listeners[data.listener]){
		acTools.listeners[data.listener](device_id, data);
	}
	for (var i = 0; i < acTools.uniListeners.length; i++) {
		acTools.uniListeners[i](device_id, data);
	}
};

airconsole.onConnect = function(device_id) {
  	// deviceConnectionChange();
  	airconsole.setActivePlayers(20);
	console.log('connected: ', arguments);
};

airconsole.onDisconnect = function(device_id) {
  //var player = airconsole.convertDeviceIdToPlayerNumber(device_id);
  //if (player != undefined) {
  //  // Player that was in game left the game.
  //  // Setting active players to length 0.
  //  // airconsole.setActivePlayers(0);
  //}
  //deviceConnectionChange();
};

airconsole.onMessage = acTools.onMessage;

// debug info
acTools.addListener(undefined, function(from, data){
	if(!data.listener || data.listener !== 'movePlayer'){
		console.log('on screen: ', from, data);
	}
});

acTools.addListener('ready', function(from, data){
	if(screen.isReady){
	  airconsole.message(from, {listener: 'ready', gameState: 'pending_game'});
	}
});

function newPlayer(device_id, player){
	console.log('newPlayer game.slotId', {slotId: game.slotId});
  	if(player.nick){
  		delete player.listener;
  		player.slotId = game.slotId;
  		player.screenId = game.screenId;
  		player.device_id = device_id;
		socket.emit('player enter pending game', player);
		screen.players[player.nick] = player;
  	}
}
acTools.addListener('newPlayer', newPlayer);

function deviceConnectionChange() {
    var active_players = airconsole.getActivePlayerDeviceIds();
    var connected_controllers = airconsole.getControllerDeviceIds();
    // Only update if the game didn't have active players.
    if (active_players.length == 0) {
      if (connected_controllers.length >= 2) {
        // Enough controller devices connected to start the game.
        // Setting the first 2 controllers to active players.
        airconsole.setActivePlayers(20);
    //     resetBall(50, 0);
    //     score = [0, 0];
    //     score_el.innerHTML = score.join(":");
    //     document.getElementById("wait").innerHTML = "";
    //   } else if (connected_controllers.length == 1) {
    //     document.getElementById("wait").innerHTML = "Need 1 more player!";
    //     resetBall(0, 0);
    //   } else if (connected_controllers.length == 0) {
    //     document.getElementById("wait").innerHTML = "Need 2 more players!";
    //     resetBall(0, 0);
      }
    }
  }

PendingGame.prototype = {
    init: function (tilemapName, slotId) {
    	document.getElementById('pendingGame').classList.remove("hidden");
		this.bindedLeaveGameAction = this.leaveGameAction.bind(this);
    	document.getElementById('leaveGameBtn').addEventListener("click", this.bindedLeaveGameAction);
		this.tilemapName = tilemapName;
		game.slotId = slotId || socket.id;
		game.screenId = socket.id;
		screen.isReady = false;
		screen.players = {};
	},

	create: function() {
		this.startGameBtn = document.getElementById('startGameBtn');
		this.startGameBtn.setAttribute('disabled', 'disabled');
		this.bindedStartGameAction = this.startGameAction.bind(this);
		this.startGameBtn.addEventListener('click', this.bindedStartGameAction);
		this.minPlayersMessage = document.getElementById('minPlayersMessage');
		this.minPlayersMessage.classList.remove('hidden');
		this.htmlPlayersElm = document.getElementById('players');
		this.htmlPlayerElm = this.htmlPlayersElm.children[0].cloneNode(true);
		this.htmlPlayersElm.innerHTML = '';
        // game.add.sprite(0, 0, 'background_s');
		socket.emit("enter pending game", {slotId: game.slotId});
		// var backdrop = game.add.image(xOffset, yOffset, "pending_game_backdrop");
		// this.startGameButton = game.add.button(buttonXOffset, startGameButtonYOffset, "start_game_button", null, this,
		// 	2, 2);
		// this.leaveGameButton = game.add.button(buttonXOffset, leaveButtonYOffset, "leave_game_button", this.leaveGameAction, null, 1, 0);
		// this.characterSquares = this.drawCharacterSquares(4);
		// this.characterImages = [];
		// this.numPlayersInGame = 0;
		// this.minPlayerMessage = game.add.text(minPlayerMessageOffsetX, minPlayerMessageOffsetY, "Cannot start game without\nat least 2 players.")
		// TextConfigurer.configureText(this.minPlayerMessage, "red", 17);
		// this.minPlayerMessage.visible = false;
		socket.on("show current players", this.populateCharacterSquares.bind(this));
		socket.on("player joined", this.playerJoined.bind(this));
		socket.on("players left", this.playersLeft.bind(this));
		socket.on("start game on client", this.startGame);
		airconsole.broadcast({listener: 'gameState', gameState: 'pending_game'});
	},

	update: function() {
	},

	// drawCharacterSquares: function(numOpenings) {
	// 	var characterSquares = [];
	// 	var yOffset = characterSquareStartingY;
	// 	var xOffset = characterSquareStartingX;
	// 	for(var i = 0; i < numCharacterSquares; i++) {
	// 		var frame = i < numOpenings ? 0 : 1;
	// 		characterSquares[i] = game.add.sprite(xOffset, yOffset, "character_square", frame);
	// 		if(i % 2 == 0) {
	// 			xOffset += characterSquareXDistance;
	// 		} else {
	// 			xOffset = characterSquareStartingX;
	// 			yOffset += characterSquareYDistance;
	// 		}
	// 	}
	// 	return characterSquares;
	// },

	populateCharacterSquares: function(data) {
		screen.isReady = true;
		this.numPlayersInGame = 0;
		this.htmlPlayersElm.innerHTML = '';
		for(var playerId in data.players) {
			var player = data.players[playerId];
			var newPlayerElm = this.htmlPlayerElm.cloneNode(true);
			newPlayerElm.children[0].innerHTML = player.nick;
        	newPlayerElm.children[1].setAttribute('src', './resource/icon_' + player.color + '.png');
        	newPlayerElm.children[2].innerHTML = 'Type: ' + player.type; // Controller, Keyboard, Remote, AI..
        	newPlayerElm.children[3].innerHTML = 'Screen: ' + player.screenName || game.screenId;
			// this.characterImages[playerId] = game.add.image(this.characterSquares[this.numPlayersInGame].position.x + characterOffsetX, 
			// this.characterSquares[this.numPlayersInGame].position.y + characterOffsetY, "bomberman_head_" + player.color);
			this.htmlPlayersElm.appendChild(newPlayerElm);
			this.numPlayersInGame++;
		}
		if(this.numPlayersInGame > 1 && game.slotId === game.screenId) {
			this.activateStartGameButton();
		} else {
			// this.minPlayerMessage.visible = true;
			this.minPlayersMessage.classList.remove('hidden');
		}
	},

	playerJoined: function(data) {
		this.numPlayersInGame++;
		// var index = this.numPlayersInGame - 1;
		// this.characterImages[data.id] = game.add.image(this.characterSquares[index].position.x + characterOffsetX, this.characterSquares[index].position.y + characterOffsetY, "bomberman_head_" +  data.color);
		if(this.numPlayersInGame == 2) {
			this.activateStartGameButton();
		}
		this.populateCharacterSquares(data);
	},
	playersLeft: function(data) {
		this.numPlayersInGame -= data.numPlayersLeft;
		if(this.numPlayersInGame == 1) {
			this.deactivateStartGameButton();
		}
		// for(var playerId in this.characterImages) {
		// 	this.characterImages[playerId].destroy();
		// }
		this.populateCharacterSquares(data);
	},

	activateStartGameButton: function() {
		// this.minPlayerMessage.visible = false;
		this.minPlayersMessage.classList.add('hidden');
		// this.startGameButton.setFrames(1, 0);
		// this.startGameButton.onInputUp.removeAll();
		// this.startGameButton.onInputUp.add(this.startGameAction, this);
		this.startGameBtn.removeAttribute('disabled');
	},

	deactivateStartGameButton: function() {
		this.minPlayersMessage.classList.remove('hidden');
		// this.minPlayerMessage.visible = true;
		// this.startGameButton.setFrames(2, 2);
		// this.startGameButton.onInputUp.removeAll();
		this.startGameBtn.setAttribute('disabled', 'disabled');
	},

	startGameAction: function() {
		this.leavingPendingGame();
		socket.emit("start game on server", {slotId: game.slotId, tilemapName: this.tilemapName});
	},

	leaveGameAction: function() {
		this.leavingPendingGame();
		socket.emit("leave pending game", {slotId: game.slotId});
		socket.removeAllListeners();
        game.state.start("Lobby");
	},
	
	leavingPendingGame: function(){
		this.startGameBtn.removeEventListener('click', this.bindedStartGameAction);
    	document.getElementById('leaveGameBtn').removeEventListener("click", this.bindedLeaveGameAction);
		document.getElementById('pendingGame').classList.add("hidden");
	},

	startGame: function(data) {
		socket.removeAllListeners();
		game.state.start("Level", true, false, data);
	}
};