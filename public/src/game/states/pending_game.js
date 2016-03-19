/* global bomberman */
var game = bomberman.game;
var socket = bomberman.socket;
var screen = bomberman.screen;
var storage = bomberman.storage;
var MAX_PLAYERS = 4;
var htmlPlayerElm; // element prototype taken from DOM

screen.isReady = false;
screen.players = {};

var airconsole = bomberman.airconsole;
var acTools = bomberman.acTools;

acTools.addListener('ready', function(from, data){
	if(screen.isReady){
	  airconsole.message(from, {listener: 'ready', gameState: 'pending-game'});
	}
});

acTools.addListener('playerReady', function playerReady(device_id, player){
  	if(player.nick){
	  	delete player.listener;
  		player.gameId = storage.gameId;
  		player.screenId = storage.screenId;
  		player.device_id = device_id;
  		player.connection = true;
  		
  		if(screen.players[player.nick]){
  			socket.emit('update player pending game', player);
  		}else{
			screen.players[player.nick] = player;
			socket.emit('player enter pending game', player);
  		}
  	}
});

var PendingGame = function() {};

module.exports = PendingGame;

PendingGame.prototype = {
    init: function (tilemapName, gameId) {
    	var self = this;
    	
		this.htmlPlayersElm = document.getElementById('players');
		if(!htmlPlayerElm){
			htmlPlayerElm = this.htmlPlayersElm.children[0].cloneNode(true);
		}
		//sets background for pending-game based on selected stage in stage-select
		document.getElementById('pending-game').style.backgroundImage = "url(" + bomberman.selectedStage.background + ")";
		
        bomberman.vmTools.showWithCbs('pending-game');
		this.bindedLeaveGameAction = this.leaveGameAction.bind(this);
    	document.getElementById('leaveGameBtn').addEventListener("click", this.bindedLeaveGameAction);
		this.tilemapName = tilemapName;
		
		storage.gameId = storage.gameId || gameId || socket.id;
		storage.screenId = storage.screenId || socket.id;
		storage.masterScreen = storage.gameId === storage.screenId;
		screen.isReady = false;
		screen.players = {};
		
		if(!storage.masterScreen){
			document.getElementById('startGameBtn').classList.add("hidden");
			document.getElementById('minPlayersMessage').classList.add("hidden");
			document.getElementById('playerDisconnectedMessage').classList.add("hidden");
			document.getElementById('playerNotReadyMessage').classList.add("hidden");
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
		  if(bomberman.viewMan.current_view.self === 'pending-game'){
		  	self.populateCharacterSquares({players: bomberman.players});
		  }
		};
	},

	create: function() {
		if(storage.masterScreen){
			this.startGameBtn = document.getElementById('startGameBtn');
			this.startGameBtn.setAttribute('disabled', 'disabled');
			this.bindedStartGameAction = this.startGameAction.bind(this);
			this.startGameBtn.addEventListener('click', this.bindedStartGameAction);
			this.playerNotReadyMessage = document.getElementById('playerNotReadyMessage');
			this.playerDisconnectedMessage = document.getElementById('playerDisconnectedMessage');
			this.minPlayersMessage = document.getElementById('minPlayersMessage');
			this.minPlayersMessage.classList.remove('hidden');
		}
		this.htmlPlayersElm.innerHTML = '';
		socket.emit("enter pending game", {gameId: storage.gameId, screenId: storage.screenId, tilemapName: this.tilemapName});
		socket.on("show current players", this.populateCharacterSquares.bind(this));
		socket.on("player joined", this.playerJoined.bind(this));
		socket.on("players left", this.playersLeft.bind(this));
		socket.on("start game on client", this.startGame.bind(this));
		airconsole.broadcast({listener: 'gameState', gameState: 'pending-game'});
	},

	update: function() {
	},

	populateCharacterSquares: function(data) {
		screen.isReady = true;
		this.numPlayersInGame = 0;
		this.htmlPlayersElm.innerHTML = '';
		this.allConnected = true;
		this.allReady = true;
		bomberman.players = data.players;
		for(var playerId in data.players) {
			var player = data.players[playerId];
			var newPlayerElm = htmlPlayerElm.cloneNode(true);
			newPlayerElm.children[0].innerHTML = player.nick;
        	newPlayerElm.children[1].setAttribute('src', './resource/icon_' + player.color + '.png');
        	newPlayerElm.children[2].innerHTML = 'Type: ' + player.controller; // Controller, Keyboard, Remote, AI..
        	newPlayerElm.children[3].innerHTML = 'Screen: ' + (player.screenName || storage.screenId);
        	newPlayerElm.children[4].innerHTML = 'Connected: ' + player.connection;
        	newPlayerElm.children[5].innerHTML = 'Ready: ' + player.ready;
			// this.characterImages[playerId] = game.add.image(this.characterSquares[this.numPlayersInGame].position.x + characterOffsetX, 
			// this.characterSquares[this.numPlayersInGame].position.y + characterOffsetY, "bomberman_head_" + player.color);
			this.htmlPlayersElm.appendChild(newPlayerElm);
			this.numPlayersInGame++;
			if(!player.connection){
				this.allConnected = false;
			}
			if(!player.ready){
				this.allReady = false;
			}
		}
		if(storage.masterScreen){
			if(this.numPlayersInGame > 1 && this.allConnected && this.allReady) {
				this.activateStartGameButton();
			} else {
				this.deactivateStartGameButton();
			}
		}
	},

	playerJoined: function(data) {
		this.numPlayersInGame++;
		if(storage.masterScreen && this.numPlayersInGame == 2) {
			this.activateStartGameButton();
		}
		this.populateCharacterSquares(data);
	},
	playersLeft: function(data) {
		this.numPlayersInGame -= data.numPlayersLeft;
		if(storage.masterScreen && this.numPlayersInGame == 1) {
			this.deactivateStartGameButton();
		}
		this.populateCharacterSquares(data);
	},

	activateStartGameButton: function() {
		this.minPlayersMessage.classList.add('hidden');
		this.playerDisconnectedMessage.classList.add('hidden');
		this.playerNotReadyMessage.classList.add('hidden');
		this.startGameBtn.removeAttribute('disabled');
	},

	deactivateStartGameButton: function() {
		if(this.numPlayersInGame < 2){
			this.minPlayersMessage.classList.remove('hidden');
		}
		if(this.allConnected){
			this.playerDisconnectedMessage.classList.remove('hidden');
		}
		if(this.allReady){
			this.playerNotReadyMessage.classList.remove('hidden');
		}
		this.startGameBtn.setAttribute('disabled', 'disabled');
	},

	startGameAction: function() {
		socket.emit("start game on server", {gameId: storage.gameId, tilemapName: this.tilemapName});
	},

	leaveGameAction: function() {
		this.leavingPendingGame();
		socket.emit("leave pending game", {gameId: storage.gameId, screenId: storage.screenId});
		socket.removeAllListeners();
        game.state.start("Lobby");
	},
	
	leavingPendingGame: function(){
		if(storage.masterScreen){
			this.startGameBtn.removeEventListener('click', this.bindedStartGameAction);
		}
    	document.getElementById('leaveGameBtn').removeEventListener("click", this.bindedLeaveGameAction);
	},

	startGame: function(data) {
		this.leavingPendingGame();
		socket.removeAllListeners();
		game.state.start("Level", true, false, data);
	}
};