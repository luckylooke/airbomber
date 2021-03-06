/* global bomberman */
var MapInfo = require("./../common/map_info");
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
		
		
        bomberman.vmTools.showWithCbs('pending-game');
		this.bindedLeaveGameAction = this.leaveGameAction.bind(this);
    	document.getElementById('leavePendingGameBtn').addEventListener("click", this.bindedLeaveGameAction);
		
		//sets background for pending-game based on selected stage in stage-select
		document.getElementById('pending-game').style.backgroundImage = "url(" + MapInfo[tilemapName].background + ")";
		
		storage.gameId = storage.gameId || gameId || socket.id;
		storage.screenId = storage.screenId || socket.id;
		bomberman.masterScreen = storage.gameId === storage.screenId;
		screen.isReady = false;
		screen.players = {};
		if(bomberman.masterScreen){
			document.getElementById('startGameBtn').classList.remove("hidden");
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
		if(bomberman.masterScreen){
			this.startGameBtn = document.getElementById('startGameBtn');
			this.bindedStartGameAction = this.startGameAction.bind(this);
			this.startGameBtn.addEventListener('click', this.bindedStartGameAction);
			this.playerNotReadyMessage = document.getElementById('playerNotReadyMessage');
			this.playerDisconnectedMessage = document.getElementById('playerDisconnectedMessage');
			this.minPlayersMessage = document.getElementById('minPlayersMessage');
		}
		this.htmlPlayersElm.innerHTML = '';
		socket.emit("enter pending game", {gameId: storage.gameId, screenId: storage.screenId});
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
        	newPlayerElm.children[4].style.backgroundColor = !player.connection ? 'red' : 'green'
        	newPlayerElm.children[5].innerHTML = 'Connected ';
        	newPlayerElm.children[6].style.backgroundColor = !player.ready ? 'red' : 'green'
        	newPlayerElm.children[7].innerHTML = 'Ready ';
        	if(bomberman.masterScreen){
        		newPlayerElm.children[8].addEventListener('click', this.kickPlayer.bind(player));
        		newPlayerElm.children[8].classList.remove('hidden');
        	}
			// this.characterImages[playerId] = game.add.image(this.characterSquares[this.numPlayersInGame].position.x + characterOffsetX, 
			// this.characterSquares[this.numPlayersInGame].position.y + characterOffsetY, "bomberman_head_" + player.color);
			this.htmlPlayersElm.appendChild(newPlayerElm);
			this.numPlayersInGame++;
			if(!player.ready){
				this.allConnected = false;
			}
			if(!player.connection){
				this.allReady = false;
			}
			// console.log(player, this.allConnected, this.allReady);
			
		}
		if(bomberman.masterScreen){
			if(this.checkStartConditions()){
				this.startGameBtn.classList.add('active');
			}else{
				this.startGameBtn.classList.remove('active');
			}
		}
	},

	playerJoined: function(data) {
		this.numPlayersInGame++;
		this.populateCharacterSquares(data);
	},
	playersLeft: function(data) {
		this.numPlayersInGame -= data.numPlayersLeft;
		this.populateCharacterSquares(data);
	},
	kickPlayer: function() {
		delete bomberman.players[this.nick];
		delete screen.players[this.nick];
		socket.emit('player leave pending game', this);
	},

	checkStartConditions: function(showMessages) {
		if(this.messageTimeout){
			this.hideAllMessages();
			clearTimeout(this.messageTimeout);
		}
		
		var self = this,
			result = true;
		if(this.numPlayersInGame < 2){
			if(showMessages){
				this.minPlayersMessage.classList.remove('hidden');
			}
			result = false;
		}
		if(!this.allConnected){
			if(showMessages){
				this.playerDisconnectedMessage.classList.remove('hidden');
			}
			result = false;
		}
		if(!this.allReady){
			if(showMessages){
				this.playerNotReadyMessage.classList.remove('hidden');
			}
			result = false;
		}
		
		this.messageTimeout = setTimeout(function(){
			self.hideAllMessages();
			self.messageTimeout = undefined;
		}, 5000);
		
		return result;
	},
	
	hideAllMessages: function(){
		this.minPlayersMessage.classList.add('hidden');
		this.playerDisconnectedMessage.classList.add('hidden');
		this.playerNotReadyMessage.classList.add('hidden');
	},

	startGameAction: function() {
		if(this.checkStartConditions('showMessages')){
			socket.emit("start game on server", {gameId: storage.gameId});
		}
	},

	leaveGameAction: function() {
		this.leavingPendingGame();
		socket.emit("leave game", {gameId: storage.gameId, screenId: storage.screenId});
		socket.removeAllListeners();
        game.state.start("Lobby");
	},
	
	leavingPendingGame: function(){
		if(bomberman.masterScreen){
			this.startGameBtn.removeEventListener('click', this.bindedStartGameAction);
		}
    	document.getElementById('leavePendingGameBtn').removeEventListener("click", this.bindedLeaveGameAction);
	},

	startGame: function(data) {
		this.leavingPendingGame();
		socket.removeAllListeners();
		game.state.start("Level", true, false, data);
	}
};