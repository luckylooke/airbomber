/* global bomberman */
var game = bomberman.game;
var socket = bomberman.socket;
var screen = bomberman.screen;
var MAX_PLAYERS = 4;
var htmlPlayerElm; // element prototype taken from DOM

screen.isReady = false;
screen.players = {};

var airconsole = bomberman.airconsole;
var acTools = bomberman.acTools;

acTools.addListener('ready', function(from, data){
	if(screen.isReady){
	  airconsole.message(from, {listener: 'ready', gameState: 'PendingGame'});
	}
});

acTools.addListener('newPlayer', function newPlayer(device_id, player){
  	if(player.nick){
  		delete player.listener;
  		player.slotId = game.slotId;
  		player.screenId = game.screenId;
  		player.device_id = device_id;
  		player.connection = true;
		socket.emit('player enter pending game', player);
		screen.players[player.nick] = player;
  	}
});

var PendingGame = function() {};

module.exports = PendingGame;

PendingGame.prototype = {
    init: function (tilemapName, slotId) {
		this.htmlPlayersElm = document.getElementById('players');
		htmlPlayerElm = this.htmlPlayersElm.children[0].cloneNode(true);
    	document.getElementById('pendingGame').classList.remove("hidden");
		this.bindedLeaveGameAction = this.leaveGameAction.bind(this);
    	document.getElementById('leaveGameBtn').addEventListener("click", this.bindedLeaveGameAction);
		this.tilemapName = tilemapName;
		this.masterScreen = slotId === socket.id;
		game.slotId = slotId || socket.id;
		game.screenId = socket.id;
		screen.isReady = false;
		screen.players = {};
		if(!this.masterScreen){
			document.getElementById('startGameBtn').classList.add("hidden");
			document.getElementById('minPlayersMessage').classList.add("hidden");
			document.getElementById('playerDisconnectedMessage').classList.add("hidden");
		}
		airconsole.onDisconnect = function(device_id) {
			var pl;
		  for(pl in screen.players){
		  	if(pl.device_id === device_id){
		  		break;
		  	}
		  }
		  if(!pl){
		  	return;
		  }
		  pl.connection = false;
		  this.populateCharacterSquares();
		};
	},

	create: function() {
		if(this.masterScreen){
			this.startGameBtn = document.getElementById('startGameBtn');
			this.startGameBtn.setAttribute('disabled', 'disabled');
			this.bindedStartGameAction = this.startGameAction.bind(this);
			this.startGameBtn.addEventListener('click', this.bindedStartGameAction);
			this.playerDisconnectedMessage = document.getElementById('playerDisconnectedMessage');
			this.minPlayersMessage = document.getElementById('minPlayersMessage');
			this.minPlayersMessage.classList.remove('hidden');
		}
		this.htmlPlayersElm.innerHTML = '';
		socket.emit("enter pending game", {slotId: game.slotId, screenId: game.screenId, tilemapName: this.tilemapName});
		socket.on("show current players", this.populateCharacterSquares.bind(this));
		socket.on("player joined", this.playerJoined.bind(this));
		socket.on("players left", this.playersLeft.bind(this));
		socket.on("start game on client", this.startGame.bind(this));
		airconsole.broadcast({listener: 'gameState', gameState: 'PendingGame'});
	},

	update: function() {
	},

	populateCharacterSquares: function(data) {
		screen.isReady = true;
		this.numPlayersInGame = 0;
		this.htmlPlayersElm.innerHTML = '';
		this.allConnected = true;
		for(var playerId in data.players) {
			var player = data.players[playerId];
			var newPlayerElm = htmlPlayerElm.cloneNode(true);
			newPlayerElm.children[0].innerHTML = player.nick;
        	newPlayerElm.children[1].setAttribute('src', './resource/icon_' + player.color + '.png');
        	newPlayerElm.children[2].innerHTML = 'Type: ' + player.controller; // Controller, Keyboard, Remote, AI..
        	newPlayerElm.children[3].innerHTML = 'Screen: ' + (player.screenName || game.screenId);
        	newPlayerElm.children[4].innerHTML = 'Connected: ' + !!player.connection;
			// this.characterImages[playerId] = game.add.image(this.characterSquares[this.numPlayersInGame].position.x + characterOffsetX, 
			// this.characterSquares[this.numPlayersInGame].position.y + characterOffsetY, "bomberman_head_" + player.color);
			this.htmlPlayersElm.appendChild(newPlayerElm);
			this.numPlayersInGame++;
			if(!player.connection){
				this.allConnected = false;
			}
		}
		if(this.masterScreen){
			if(this.numPlayersInGame > 1 && this.allConnected) {
				this.activateStartGameButton();
			} else {
				this.deactivateStartGameButton();
			}
		}
	},

	playerJoined: function(data) {
		this.numPlayersInGame++;
		if(this.masterScreen && this.numPlayersInGame == 2) {
			this.activateStartGameButton();
		}
		this.populateCharacterSquares(data);
	},
	playersLeft: function(data) {
		this.numPlayersInGame -= data.numPlayersLeft;
		if(this.masterScreen && this.numPlayersInGame == 1) {
			this.deactivateStartGameButton();
		}
		this.populateCharacterSquares(data);
	},

	activateStartGameButton: function() {
		this.minPlayersMessage.classList.add('hidden');
		this.playerDisconnectedMessage.classList.add('hidden');
		this.startGameBtn.removeAttribute('disabled');
	},

	deactivateStartGameButton: function() {
		if(this.numPlayersInGame < 2){
			this.minPlayersMessage.classList.remove('hidden');
		}
		if(this.allConnected){
			this.playerDisconnectedMessage.classList.remove('hidden');
		}
		this.startGameBtn.setAttribute('disabled', 'disabled');
	},

	startGameAction: function() {
		socket.emit("start game on server", {slotId: game.slotId, tilemapName: this.tilemapName});
	},

	leaveGameAction: function() {
		this.leavingPendingGame();
		socket.emit("leave pending game", {slotId: game.slotId, screenId: game.screenId});
		socket.removeAllListeners();
      	bomberman.acTools.currentView = 'Lobby';
        game.state.start("Lobby");
	},
	
	leavingPendingGame: function(){
		if(this.masterScreen){
			this.startGameBtn.removeEventListener('click', this.bindedStartGameAction);
		}
    	document.getElementById('leaveGameBtn').removeEventListener("click", this.bindedLeaveGameAction);
		document.getElementById('pendingGame').classList.add("hidden");
	},

	startGame: function(data) {
		this.leavingPendingGame();
		socket.removeAllListeners();
      	acTools.currentView = 'Level';
		game.state.start("Level", true, false, data);
	}
};