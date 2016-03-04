/******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};

/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {

/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId])
/******/ 			return installedModules[moduleId].exports;

/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			exports: {},
/******/ 			id: moduleId,
/******/ 			loaded: false
/******/ 		};

/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);

/******/ 		// Flag the module as loaded
/******/ 		module.loaded = true;

/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}


/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;

/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;

/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";

/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(0);
/******/ })
/************************************************************************/
/******/ ([
/* 0 */
/***/ function(module, exports, __webpack_require__) {

	/* global Phaser, bomberman, io */
	if(!bomberman) {
	    bomberman = {};
	}

	bomberman.width = bomberman.bomberElm.clientWidth;
	bomberman.height = bomberman.bomberElm.clientHeight;

	var game = bomberman.game = new Phaser.Game(bomberman.width, bomberman.height, Phaser.AUTO, 'bomber');
	bomberman.screen = {};

	function getURLParameter(name) {
	  return decodeURIComponent((new RegExp('[?|&]' + name + '=' + '([^&;]+?)(&|#|;|$)').exec(location.search)||[,""])[1].replace(/\+/g, '%20'))||null;
	}

	var once = false;
	var socketServer;
	if(getURLParameter('cloud9')){
	    socketServer = 'cloud9';
	    bomberman.socket = io(); // cloud9
	}else{
	    socketServer = 'openshift';
	    bomberman.socket = io('http://airbomber-luckylooke.rhcloud.com:8000'); // openshift
	}
	bomberman.socket.on('connect_error', function(err){
	    if(!once){ // try once fallback to cloud9
	        bomberman.socket = io(); // cloud9
	        socketServer = 'cloud9';
	        once = true;
	    }else{
	        console.log('SOCKET CANNOT CONNECT', err);
	    }
	});
	bomberman.socket.on('connect', function(){
	    console.log('socket server: ', socketServer);
	    game.state.start('Boot');
	});
	bomberman.level = null;

	game.state.add("Boot", __webpack_require__(1));
	game.state.add("Preloader", __webpack_require__(4));
	game.state.add("Lobby", __webpack_require__(5));
	game.state.add("StageSelect", __webpack_require__(6));
	game.state.add("PendingGame", __webpack_require__(7));
	game.state.add("Level", __webpack_require__(8));
	game.state.add("GameOver", __webpack_require__(17));

	__webpack_require__(18);undefined


/***/ },
/* 1 */
/***/ function(module, exports, __webpack_require__) {

	/* global bomberman */
	var AudioPlayer = __webpack_require__(2);
	var TextConfigurer = __webpack_require__(3);
	var game = bomberman.game;

	var textXOffset = 420;
	var textYOffset = 200;

	var Boot = function () {
	};

	module.exports = Boot;

	Boot.prototype = {

	    preload: function () {
	    },

	    create: function () {
	        /* disableVisibilityChange : boolean
	            By default if the browser tab loses focus the game will pause. You can stop that behaviour by setting this property to true.
	        */
	        game.stage.disableVisibilityChange = true;
	        // game.input.maxPointers = 1;
	        AudioPlayer.initialize();
	        // if (game.device.desktop) {
	        game.stage.scale.pageAlignHorizontally = true;
	        game.state.start('Preloader');
	        // } else {
	        //     var text = game.add.text(textXOffset, textYOffset, 'Please run the game on your computer');
	        //     TextConfigurer.configureText(text, "white", 45);
	        //     text.anchor.setTo(.5, .5);
	        // }
	    }
	};


/***/ },
/* 2 */
/***/ function(module, exports) {

	/* global bomberman */
	var game = bomberman.game;
	var bombSound;
	var powerupSound;
	var musicSound;

	module.exports = {
		initialize: function() {
			bombSound = game.add.audio("explosion");
			powerupSound = game.add.audio("powerup");
	        // musicSound = game.add.audio("music", 0.5);
		},

		playBombSound: function() {
			bombSound.play();
		},

		playPowerupSound: function() {
			powerupSound.play();
	    },

	    playMusicSound: function () {
	        // musicSound.play();
	    },
	    stopMusicSound: function () {
	        // musicSound.stop();
	    }
	};

/***/ },
/* 3 */
/***/ function(module, exports) {

	exports.configureText = function(text, color, size) {
		text.font = "Carter One";
		text.fill = color;
		text.fontSize = size;
	};

/***/ },
/* 4 */
/***/ function(module, exports) {

	/* global Phaser, bomberman*/
	var game = bomberman.game;
	var Preloader = function () {
	};

	module.exports = Preloader;

	Preloader.prototype = {

	    preload: function () {
	        this.load.spritesheet("bomberman_white", "resource/bomberman_white.png", 32, 64);
	        
	        game.scale.setGameSize(25*35, 15*35);
	        game.scale.scaleMode = Phaser.ScaleManager.SHOW_ALL;
	        game.scale.setMinMax(480, 260, 10240, 7680);
	        game.scale.pageAlignHorizontally = true;
	        // game.scale.pageAlignVertically = true;
	        
	        // var gameRatio = 800/600,
	        //     scaleRatio = 1;
	        // if(bomberman.height/bomberman.width > gameRatio){
	        //     scaleRatio = bomberman.height/600;
	        // }else{
	        //     scaleRatio = bomberman.width/800;
	        // }
	        // game.world.scale = {x:scaleRatio,y:scaleRatio};

	        this.load.spritesheet("bomberman_white", "resource/bomberman.png", 32, 64);
	        this.load.spritesheet("bomberman_black", "resource/bomberman_black.png", 32, 64);
	        this.load.spritesheet("bomberman_blue", "resource/bomberman_blue.png", 32, 64);
	        this.load.spritesheet("bomberman_red", "resource/bomberman_red.png", 32, 64);
	        this.load.spritesheet("bomb", "resource/bomb.png", 35, 35);
	        this.load.spritesheet("explosion_top", "resource/explosion_top.png", 30, 40);
	        this.load.spritesheet("explosion_bottom", "resource/explosion_bottom.png", 30, 40);
	        this.load.spritesheet("explosion_left", "resource/explosion_left.png", 40, 30);
	        this.load.spritesheet("explosion_right", "resource/explosion_right.png", 40, 30);
	        this.load.spritesheet("explosion_center", "resource/explosion_center.png", 30, 30);
	        this.load.spritesheet("explosion_horizontal", "resource/explosion_horizontal.png", 40, 30);
	        this.load.spritesheet("explosion_vertical", "resource/explosion_vertical.png", 30, 40);
	        this.load.spritesheet("left_select_button", "resource/left_select_button.png", 60, 60);
	        this.load.spritesheet("right_select_button", "resource/right_select_button.png", 60, 60);
	        this.load.spritesheet("ok_button", "resource/ok_button.png", 60, 60);
	        this.load.spritesheet("character_square", "resource/character_square.png", 89, 89);
	        this.load.spritesheet("start_game_button", "resource/start_game_button.png", 202, 43);
	        this.load.spritesheet("leave_game_button", "resource/leave_game_button.png", 202, 43);
	        this.load.spritesheet("game_slot", "resource/game_slot.png", 522, 48);
	        this.load.tilemap("First", "assets/levels/Arena_map.json", null, Phaser.Tilemap.TILED_JSON);
	        this.load.tilemap("Second", "assets/levels/level_one.json", null, Phaser.Tilemap.TILED_JSON);
	        this.load.tilemap("Third", "assets/levels/level_two.json", null, Phaser.Tilemap.TILED_JSON);
	        // this.load.tilemap("levelTwo", "assets/levels/Arena_map.json", null, Phaser.Tilemap.TILED_JSON);
	        this.load.image("tiles", "resource/tileset.png");
	        this.load.image("select_stage", "resource/select_stage.png");
	        // this.load.image("first_", "assets/levels/thumbnails/danger_desert_thumbnail.png");
	        // this.load.image("danger_desert_thumbnail", "assets/levels/thumbnails/danger_desert_thumbnail.png");
	        this.load.image("pending_game_backdrop", "resource/lobby_backdrop.png");
	        this.load.image("round_end_display", "resource/end_of_round_window.png");
	        this.load.image("bomberman_head_white", "resource/icon_white.png");
	        this.load.image("bomberman_head_blue", "resource/icon_blue.png");
	        this.load.image("bomberman_head_green", "resource/icon_green.png");
	        this.load.image("bomberman_head_purple", "resource/bomberman_head_purple.png");
	        this.load.image("bomberman_head_red", "resource/bomberman_head_red.png");
	        this.load.image("bomberman_head_black", "resource/icon_black.png");
	        this.load.image("bomb_count_powerup", "resource/BombPowerup.png");
	        this.load.image("bomb_strength_powerup", "resource/FlamePowerup.png");
	        this.load.image("speed_powerup", "resource/SpeedPowerup.png");
	        this.load.image("bomb_count_notification", "resource/bomb_count_notification.png");
	        this.load.image("bomb_strength_notification", "resource/bomb_strength_notification.png");
	        this.load.image("speed_notification", "resource/speed_notification.png");
	        this.load.image("round_1", "resource/round_1.png");
	        this.load.image("round_2", "resource/round_2.png");
	        this.load.image("final_round", "resource/final_round.png");
	        this.load.image("tiebreaker", "resource/tiebreaker.png");
	        // this.load.image("background", "resource/Background_1.png");
	        // this.load.image("background_b", "resource/Background_button.png");
	        // this.load.image("background_s", "resource/Background_select.png");

	        this.load.audio("explosion", "assets/sounds/bomb.ogg");
	        this.load.audio("powerup", "assets/sounds/powerup.ogg");
	        // this.load.audio("music", "assets/sounds/music.ogg");
	    },

	    create: function () {
	        game.state.start("Lobby");
	    }
	};


/***/ },
/* 5 */
/***/ function(module, exports) {

	/* global bomberman */
	var game = bomberman.game;
	var socket = bomberman.socket;
	var Lobby = function() {};

	module.exports = Lobby;

	Lobby.prototype = {
	    init: function () {
	        document.getElementById('lobby').classList.remove("hidden");
		},

		create: function() {
			this.stateSettings = {
				empty: {
					outFrame: 0,
					overFrame: 1,
	                text: "Host Game ",
					callback: this.hostGameAction
				},
				joinable: {
					outFrame: 2,
					overFrame: 3,
					text: "Join Game ",
					callback: this.joinGameAction
				},
				settingup: {
					outFrame: 4,
					overFrame: 5,
					text: "Game is being set up... ",
					callback: null
				},
				inprogress: {
					outFrame: 4,
					overFrame: 5,
					text: "Game in Progress ",
					callback: null
				},
				full: {
					outFrame: 4,
					overFrame: 5,
					text: "Game Full ",
					callback: null
				}
			};
	        socket.on("update slots", this.updateSlots.bind(this));
			socket.emit("enter lobby");
		},

		update: function() {
		},

		updateSlots: function(slots) {
			var htmlSlotsElm = document.getElementById('slots');
			var htmlSlotElm = htmlSlotsElm.children[0].cloneNode(true);
			htmlSlotsElm.innerHTML = '';
			
			var names = Object.keys(slots);
	        for (var i = 0; i < names.length; i++) {
	        	var slot = slots[names[i]];
		        var settings = this.stateSettings[slot.state];
		        var callback = (function (slotId) {
		            return function(){
		            	if (settings.callback != null){
		                	settings.callback(slotId);
		            	}
		                document.getElementById('lobby').classList.add("hidden");
		            };
		        })(names[i]);
	        	
	        	var newSlotElm = htmlSlotElm.cloneNode(true);
	        	newSlotElm.innerHTML = settings.text + (slot.numOfPlayers ? "(" + slot.numOfPlayers +")" : "");
	        	newSlotElm.addEventListener("click", callback);
	        	htmlSlotsElm.appendChild(newSlotElm);
	        }
		},

		hostGameAction: function() {
			socket.emit("host game", {slotId: socket.id});
			socket.removeAllListeners();
	        game.state.start("StageSelect", true, false);
		},

		joinGameAction: function(slotId) {
			socket.removeAllListeners();
	        game.state.start("PendingGame", true, false, null, slotId);
		}
	};

/***/ },
/* 6 */
/***/ function(module, exports) {

	/* global bomberman */
	var game = bomberman.game;
	var socket = bomberman.socket;
	var StageSelect = function() {};

	module.exports = StageSelect;

	// var xOffset = 180;
	// var yOffset = 25;
	// var thumbnailXOffset = 396;
	// var thumbnailYOffset = 125;
	// var stageNameYOffset = 320;

	var stages = [
		{name: "Green field", thumbnailFile: "../resource/green_field_thumbnail.png", tilemapName: "First", maxPlayers: 4, size: "Small", background:"../resource/green_field_background.png"},
		{name: "Desert", thumbnailFile: "../resource/danger_desert_thumbnail.png", tilemapName: "Second", maxPlayers: 4, size: "Small", background:"../resource/danger_desert_background.png"},
		{name: "Desert2", thumbnailFile: "../resource/danger_desert_thumbnail.png", tilemapName: "Third", maxPlayers: 4, size: "Small", background:"../resource/danger_desert_background.png"},
	];

	StageSelect.prototype = {
	    init: function () {
	    	document.getElementById('stage-select').classList.remove("hidden");
	    	
		},

		create: function() {
			var htmlStagesElm = document.getElementById('stages');
			var htmlStageElm = htmlStagesElm.children[0].cloneNode(true);
			var completeStages = [];
			var arrow_left = document.getElementById('arrow-left');
			var arrow_right = document.getElementById('arrow-right');
			var stageSelectElement = document.getElementById('stage-select');
			var pendingGameElement = document.getElementById('pendingGame');
			var currentStage = 0;
			htmlStagesElm.innerHTML = '';
			
			var stage,
				newStageElm;
	        
	        for (var i = 0; i < stages.length; i++) {
	        	stage = stages[i];
	        	newStageElm = htmlStageElm.cloneNode(true);
	        	newStageElm.children[0].innerHTML = stage.name;
	        	newStageElm.children[1].setAttribute('src', stage.thumbnailFile);
	        	newStageElm.children[2].innerHTML = 'Max players: ' + stage.maxPlayers;
	        	newStageElm.children[3].innerHTML = 'Size: ' + stage.size;
	        	newStageElm.addEventListener("click", this.getHandler(i));
	        	newStageElm.classList.add("hidden");
	        	newStageElm.background = stage.background;
	        	htmlStagesElm.appendChild(newStageElm);
	        	completeStages.push(newStageElm);
	        }
	        
	        stageSelectElement.style.backgroundImage = "url(" + completeStages[0].background + ")";
	        pendingGameElement.style.backgroundImage = "url(" + completeStages[0].background + ")";	
	        completeStages[0].classList.remove("hidden");
	        // game.add.sprite(0, 0, 'background_s');
			// var selectionWindow = game.add.image(xOffset, yOffset, "select_stage");
	        // this.okButton = game.add.button(625, 425, "ok_button", this.confirmStageSelection, this, 1, 0);
	        // this.thumbnail = game.add.image(thumbnailXOffset, thumbnailYOffset, stage.thumbnailKey);
	        // this.text = game.add.text(game.camera.width / 2, stageNameYOffset, stage.name);
			// this.configureText(this.text, "white", 28);
			// this.text.anchor.setTo(.5, .5);
	  //      this.numPlayersText = game.add.text(360, 380, "Max # of players:   " + stage.maxPlayers);
			// this.configureText(this.numPlayersText, "white", 18);
	  //      this.stageSizeText = game.add.text(360, 410, "Map size:   " + stage.size);
			// this.configureText(this.stageSizeText, "white", 18);
			
			
			
			arrow_left.addEventListener('click',function(f){
			completeStages[currentStage].classList.add("hidden");
				currentStage--;
				if(currentStage < 0)
					currentStage = completeStages.length - 1;
					
				stageSelectElement.style.backgroundImage = "url(" + completeStages[currentStage].background + ")";	
				pendingGameElement.style.backgroundImage = "url(" + completeStages[currentStage].background + ")";	
			
			completeStages[currentStage].classList.remove("hidden");		
			})
			
			arrow_right.addEventListener('click',function(f){
				completeStages[currentStage].classList.add("hidden");
				
				currentStage++;
				if(currentStage >= completeStages.length)
					currentStage = 0;
					
				stageSelectElement.style.backgroundImage = "url(" + completeStages[currentStage].background + ")";	
				pendingGameElement.style.backgroundImage = "url(" + completeStages[currentStage].background + ")";	
					
				completeStages[currentStage].classList.remove("hidden");	
			})
		},

		update: function() {
		},

		// configureText: function(text, color, size) {
		// 	text.font = "Carter One";
		// 	text.fill = color;
		// 	text.fontSize = size;
		// },

		getHandler: function(index) {
			return function confirmStageSelection(){
				document.getElementById('stage-select').classList.add("hidden");
		        socket.emit("select stage", {slotId: socket.id, mapName: stages[index].tilemapName});
		        game.state.start("PendingGame", true, false, stages[index].tilemapName, socket.id);
			};
		}
		
	};


/***/ },
/* 7 */
/***/ function(module, exports, __webpack_require__) {

	/* global bomberman, AirConsole */
	var TextConfigurer = __webpack_require__(3);
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

/***/ },
/* 8 */
/***/ function(module, exports, __webpack_require__) {

	/* global Phaser, bomberman */
	var BLACK_HEX_CODE = "#000000";
	var TILE_SIZE = 35;

	var PowerupIDs = __webpack_require__(9);
	var MapInfo = __webpack_require__(10);
	var AudioPlayer = __webpack_require__(2);
	var Player = __webpack_require__(11);
	var RemotePlayer = __webpack_require__(13);
	var Bomb = __webpack_require__(12);
	var RoundEndAnimation = __webpack_require__(14);
	var PowerupImageKeys = __webpack_require__(15);
	var PowerupNotificationPlayer = __webpack_require__(16);
	var game = bomberman.game;
	var socket = bomberman.socket;
	var level = bomberman.level;
	var screen = bomberman.screen;

	var Level = function () {};
	var controllers = {}, // keeps state of connected controllers
	    airconsole = bomberman.airconsole,
	    acTools = bomberman.acTools;

	function movePlayer(device_id, data) {
	  if (data.nick && controllers[data.nick]) {
	      if(data.x != undefined){
	          controllers[data.nick].x = data.x;
	      }
	      if(data.y != undefined){
	          controllers[data.nick].y = data.y;
	      }
	      controllers[data.nick].type = data.type;
	  }
	}
	acTools.addListener('movePlayer', movePlayer);

	function setBomb(device_id, data) {
	  if (data.nick) {
	    controllers[data.nick].bomb = data.setting;
	  }
	}
	acTools.addListener('setBomb', setBomb);

	module.exports = Level;

	Level.prototype = {
	    remotePlayers: {},

	    gameFrozen: true,

	    init: function (data) {
	        this.tilemapName = data.mapName;
	        this.players = data.players;
	    },

	    setEventHandlers: function () {
	        socket.on("disconnect", this.onSocketDisconnect);
	        socket.on("move player", this.onMovePlayer.bind(this));
	        socket.on("remove player", this.onRemovePlayer.bind(this));
	        socket.on("kill player", this.onKillPlayer.bind(this));
	        socket.on("place bomb", this.onPlaceBomb.bind(this));
	        socket.on("detonate", this.onDetonate.bind(this));
	        socket.on("new round", this.onNewRound.bind(this));
	        socket.on("end game", this.onEndGame.bind(this));
	        socket.on("no opponents left", this.onNoOpponentsLeft.bind(this));
	        socket.on("powerup acquired", this.onPowerupAcquired.bind(this));
	    },

	    create: function () {
	        bomberman.level = this;
	        level = this;
	        this.lastFrameTime;
	        this.deadGroup = [];

	        this.initializeMap();

	        this.bombs = game.add.group();
	        this.items = {};
	        game.physics.enable(this.bombs, Phaser.Physics.ARCADE);
	        game.physics.arcade.enable(this.blockLayer);

	        this.setEventHandlers();
	        this.initializePlayers();

	        this.createDimGraphic();
	        this.beginRoundAnimation("round_1");
	        //AudioPlayer.playMusicSound();
			airconsole.broadcast({listener: 'gameState', gameState: 'level'});
	    },

	    createDimGraphic: function () {
	        this.dimGraphic = game.add.graphics(0, 0);
	        this.dimGraphic.alpha = .7;
	        this.dimGraphic.beginFill(BLACK_HEX_CODE, 1);
	        this.dimGraphic.drawRect(0, 0, game.camera.width, game.camera.height);
	        this.dimGraphic.endFill();
	    },

	    restartGame: function () {
	        this.dimGraphic.destroy();

	        for (var i in screen.players) {
	            screen.players[i].reset();
	        }
	        for (var i in this.remotePlayers) {
	            this.remotePlayers[i].reset();
	        }

	        this.deadGroup = [];
	        this.lastFrameTime;
	        this.tearDownMap();
	        this.initializeMap();
	        this.bombs.destroy(true);
	        this.destroyItems();
	        this.bombs = new Phaser.Group(game);
	        game.world.setChildIndex(this.bombs, 2);

	        this.gameFrozen = false;
	        socket.emit("ready for round");
	    },

	    destroyItems: function () {
	        for (var itemKey in this.items) {
	            this.items[itemKey].destroy();
	        }
	        this.items = {};
	    },

	    onNewRound: function (data) {
	        this.createDimGraphic();
	        var datAnimationDoe = new RoundEndAnimation(game, data.completedRoundNumber, data.roundWinnerColors);
	        this.gameFrozen = true;
	        var roundImage;
	        if (data.completedRoundNumber < 2) {
	            roundImage = "round_" + (data.completedRoundNumber + 1);
	        } else if (data.completedRoundNumber == 2) {
	            roundImage = "final_round";
	        } else {
	            roundImage = "Oops";
	        }
	        datAnimationDoe.beginAnimation(this.beginRoundAnimation.bind(this, roundImage, this.restartGame.bind(this)));
	    },

	    onEndGame: function (data) {
	        this.createDimGraphic();
	        this.gameFrozen = true;
	        var animation = new RoundEndAnimation(game, data.completedRoundNumber, data.roundWinnerColors);
	        animation.beginAnimation(function () {
	            controllers = {};
	            game.state.start("GameOver", true, false, data.gameWinnerColor, false);
	        });
	        AudioPlayer.stopMusicSound();
	    },

	    onNoOpponentsLeft: function (data) {
	        controllers = {};
	        game.state.start("GameOver", true, false, null, true);
	    },

	    beginRoundAnimation: function (image, callback) {
	        var beginRoundText = game.add.image(-600, game.camera.height / 2, image);
	        beginRoundText.anchor.setTo(.5, .5);
	        var tween = game.add.tween(beginRoundText);
	        tween.to({x: game.camera.width / 2}, 300).to({x: 1000}, 300, Phaser.Easing.Default, false, 800).onComplete.add(function () {
	            this.dimGraphic.destroy();
	            beginRoundText.destroy();
	            this.gameFrozen = false;
	            if (callback) {
	                callback();
	            }
	        }, this);

	        tween.start();
	    },

	    update: function () {
	        for (var i in screen.players) {
	            var player = screen.players[i];
	            if (player != null && player.alive == true) {
	                if (this.gameFrozen) {
	                    player.freeze();
	                } else {
	                    player.handleInput(controllers[player.nick]);
	                    for (var itemKey in this.items) {
	                        var item = this.items[itemKey];
	                        game.physics.arcade.overlap(player, item, function (p, i) {
	                            socket.emit("powerup overlap", {x: item.x, y: item.y, nick: player.nick, slotId: game.slotId});
	                        });
	                    }
	                }
	            }
	        }

	        this.stopAnimationForMotionlessPlayers();
	        this.storePreviousPositions();

	        for (var nick in this.remotePlayers) {
	            this.remotePlayers[nick].interpolate(this.lastFrameTime);
	        }

	        this.lastFrameTime = game.time.now;

	        this.destroyDeadSprites();
	    },

	    destroyDeadSprites: function () {
	        level.deadGroup.forEach(function (deadSprite) {
	            deadSprite.destroy();
	        });
	    },

	    render: function () {
	        if (window.debugging == true) {
	            for (var i in screen.players) {
	                var player = screen.players[i];
	                game.debug.body(player);
	            }
	        }
	    },

	    storePreviousPositions: function () {
	        for (var nick in this.remotePlayers) {
	            var remotePlayer = this.remotePlayers[nick];
	            remotePlayer.previousPosition = {x: remotePlayer.position.x, y: remotePlayer.position.y};
	        }
	    },

	    stopAnimationForMotionlessPlayers: function () {
	        for (var nick in this.remotePlayers) {
	            var remotePlayer = this.remotePlayers[nick];
	            if (remotePlayer.lastMoveTime < game.time.now - 200) {
	                remotePlayer.animations.stop();
	            }
	        }
	    },

	    onSocketDisconnect: function () {
	        console.log("Disconnected from socket server.");
	    },

	    initializePlayers: function () {
	        for (var i in this.players) {
	            var player = this.players[i];
	            if (player.nick in screen.players) {
	                controllers[player.nick] = {};
	                screen.players[player.nick] = new Player(player.x, player.y, player.nick, player.color);
	            } else {
	                this.remotePlayers[player.nick] = new RemotePlayer(player.x, player.y, player.nick, player.color);
	            }
	        }
	    },

	    tearDownMap: function () {
	        this.map.destroy();
	        this.groundLayer.destroy();
	        this.blockLayer.destroy();
	    },

	    initializeMap: function () {
	        this.map = game.add.tilemap(this.tilemapName);
	        var mapInfo = MapInfo[this.tilemapName];

	        this.map.addTilesetImage(mapInfo.tilesetName, mapInfo.tilesetImage, 35, 35);
	        this.groundLayer = new Phaser.TilemapLayer(game, this.map, this.map.getLayerIndex(mapInfo.groundLayer), game.width, game.height);
	        game.world.addAt(this.groundLayer, 0);
	        this.groundLayer.resizeWorld();
	        this.blockLayer = new Phaser.TilemapLayer(game, this.map, this.map.getLayerIndex(mapInfo.blockLayer), game.width, game.height);
	        game.world.addAt(this.blockLayer, 1);
	        this.blockLayer.resizeWorld();
	        this.map.setCollision(mapInfo.collisionTiles, true, mapInfo.blockLayer);
	        var blockLayerData = game.cache.getTilemapData(this.tilemapName).data.layers[1];
	        socket.emit("register map", {
	            tiles: blockLayerData.data,
	            height: blockLayerData.height,
	            width: blockLayerData.width,
	            destructibleTileId: mapInfo.destructibleTileId,
	            slotId: game.slotId
	        });
	    },

	    onMovePlayer: function (remotePlayer) {
	        if (!this.remotePlayers[remotePlayer.nick] || this.gameFrozen) {
	            return;
	        }
	        var movingPlayer = this.remotePlayers[remotePlayer.nick];
	        if (movingPlayer.targetPosition) {
	            if (remotePlayer.x == movingPlayer.targetPosition.x && remotePlayer.y == movingPlayer.targetPosition.y) {
	                return;
	            }
	            movingPlayer.animations.play(remotePlayer.facing);
	            movingPlayer.position.x = movingPlayer.targetPosition.x;
	            movingPlayer.position.y = movingPlayer.targetPosition.y;
	            movingPlayer.distanceToCover = {
	                x: remotePlayer.x - movingPlayer.targetPosition.x,
	                y: remotePlayer.y - movingPlayer.targetPosition.y
	            };
	            movingPlayer.distanceCovered = {x: 0, y: 0};
	        }
	        movingPlayer.targetPosition = {x: remotePlayer.x, y: remotePlayer.y};
	        movingPlayer.lastMoveTime = game.time.now;
	    },

	    onRemovePlayer: function (player) {
	        var playerToRemove = this.remotePlayers[player.nick];
	        if (playerToRemove.alive) {
	            playerToRemove.destroy();
	        }

	        delete this.remotePlayers[player.nick];
	        delete this.players[player.nick];
	    },

	    onKillPlayer: function (player) {
	        if (this.remotePlayers[player.nick]) {
	            this.remotePlayers[player.nick].kill();
	        } else if(screen.players[player.nick]){
	            screen.players[player.nick].kill();
	        }
	    },

	    onPlaceBomb: function (data) {
	        this.bombs.add(new Bomb(data.x, data.y, data.id));
	    },

	    onDetonate: function (data) {
	        Bomb.renderExplosion(data.explosions);
	        level.bombs.forEach(function (bomb) {
	            if (bomb && bomb.id == data.id) {
	                bomb.remove();
	            }
	        }, level);
	        data.destroyedTiles.forEach(function (destroyedTile) {
	            this.map.removeTile(destroyedTile.col, destroyedTile.row, 1);
	            if (destroyedTile.itemId) {
	                this.generateItemEntity(destroyedTile.itemId, destroyedTile.row, destroyedTile.col);
	            }
	        }, this);
	        airconsole.broadcast({listener:'vibrator', vibrate:100});
	    },

	    onPowerupAcquired: function (data) {
	        this.items[data.powerupId].destroy();
	        delete this.items[data.powerupId];

	        if (screen.players[data.acquiringPlayerId]) {
	            var player = screen.players[data.acquiringPlayerId];
	            AudioPlayer.playPowerupSound();
	            PowerupNotificationPlayer.showPowerupNotification(data.powerupType, player.x, player.y);
	            if (data.powerupType == PowerupIDs.SPEED) {
	                player.applySpeedPowerup();
	            }
	        }
	    },

	    generateItemEntity: function (itemId, row, col) {
	        var imageKey = PowerupImageKeys[itemId];
	        var item = new Phaser.Sprite(game, col * TILE_SIZE, row * TILE_SIZE, imageKey);
	        game.physics.enable(item, Phaser.Physics.ARCADE);
	        this.items[row + "." + col] = item;

	        game.world.addAt(item, 2);
	    }
	};


/***/ },
/* 9 */
/***/ function(module, exports) {

	module.exports = {
		BOMB_STRENGTH: 5,

		BOMB_CAPACITY: 6,

		SPEED: 7,

		isAPowerup: function(id) {
			return id === this.BOMB_STRENGTH || id === this.BOMB_CAPACITY || id === this.SPEED;
		}
	};

/***/ },
/* 10 */
/***/ function(module, exports) {

	var MapInfo = {
		First: {
			spawnLocations: [{x: 8, y: 1}, {x: 23, y: 1}, {x: 3, y: 1}, {x: 12, y: 6}],
			collisionTiles: [3, 4],
			groundLayer: "Ground",
			blockLayer: "Blocks",
			tilesetName: "tiles",
			tilesetImage: "tiles",
			destructibleTileId: 4
		},
		Second: {
			spawnLocations: [{x: 2, y: 1}, {x: 13, y: 1}, {x: 2, y: 13}, {x: 13, y: 13}],
			collisionTiles: [169, 191],
			groundLayer: "Ground",
			blockLayer: "Blocks",
			tilesetName: "tiles",
			tilesetImage: "tiles",
			destructibleTileId: 191
		}
	};

	module.exports = MapInfo;

/***/ },
/* 11 */
/***/ function(module, exports, __webpack_require__) {

	/* global Phaser, bomberman */

	var Bomb = __webpack_require__(12);
	var game = bomberman.game;
	var socket = bomberman.socket;
	var level; // cannot be assigned now because level isnt initialized yet

	var DEFAULT_PLAYER_SPEED = 250;
	var PLAYER_SPEED_POWERUP_INCREMENT = 25;

	var Player = function (x, y, nick, color) {
	    if(!level){
	        level = bomberman.level;
	    }
	    
	    Phaser.Sprite.call(this, game, x, y, "bomberman_" + color);

	    this.spawnPoint = {x: x, y: y};
	    this.nick = nick;
	    this.nicks.push(nick);
	    this.facing = "down";
	    this.bombButtonJustPressed = false;
	    this.speed = DEFAULT_PLAYER_SPEED;
	    
	    game.physics.enable(this, Phaser.Physics.ARCADE);

	    this.anchor.setTo(0.1, 0.6);
	    this.body.setSize(20, 19, 5, 16);

	    this.animations.add('up', [0, 1, 2, 3, 4, 5, 6, 7], 15, true);
	    this.animations.add('down', [8, 9, 10, 11, 12, 13, 14, 15], 15, true);
	    this.animations.add('right', [16, 17, 18, 19, 20, 21, 22, 23], 15, true);
	    this.animations.add('left', [24, 25, 26, 27, 28, 29, 30, 31], 15, true);

	    game.add.existing(this);
	};

	Player.prototype = Object.create(Phaser.Sprite.prototype);

	Player.prototype.nicks = [];

	Player.prototype.handleInput = function (ctrl) {
	    if(ctrl.type === 'keyboard'){
	        this.handleKeysInput();
	        this.handleBombInput();
	    }else{
	        this.handleCtrlInput(ctrl);
	    }
	};

	Player.prototype.handleCtrlInput = function (ctrl) {
	    
	    // COLLISINONS
	    game.physics.arcade.collide(this, level.blockLayer);
	    game.physics.arcade.collide(this, level.bombs);

	    
	    // MOVEMENT
	    ctrl.x = ctrl.x > 1 ? 1 : ctrl.x;
	    ctrl.x = ctrl.x < -1 ? -1 : ctrl.x;
	    ctrl.y = ctrl.y > 1 ? 1 : ctrl.y;
	    ctrl.y = ctrl.y < -1 ? -1 : ctrl.y;
	    
	    if(ctrl.type === 'DPad'){
	        this.body.velocity.x = ctrl.x * this.speed;
	        this.body.velocity.y = ctrl.y * this.speed;
	    }
	    
	    // gyroscope/accelerators movement
	    if(ctrl.type === 'Gyro'){
	      
	        if (ctrl.x < 0.1 && ctrl.x > -0.1) {
	          this.body.velocity.x = 0;
	        }else {
	          this.body.velocity.x = ctrl.x * this.speed;
	        }
	      
	        if (ctrl.y < 0.1 && ctrl.y > -0.1) {
	          this.body.velocity.y = 0;
	        }else {
	          this.body.velocity.y = ctrl.y * this.speed;
	        }
	    }
	    
	    // FACING
	    if(Math.abs(ctrl.x) > Math.abs(ctrl.y)){
	      if (ctrl.x > 0) {
	        this.facing = "right";
	      }
	      else {
	        this.facing = "left";
	      }
	    }else{
	      if (ctrl.y > 0) {
	        this.facing = "down";
	      }
	      else {
	        this.facing = "up";
	      }
	    }
	    
	    if (ctrl.x || ctrl.y) {
	        this.animations.play(this.facing);
	        socket.emit("move player", {x: this.position.x, y: this.position.y, facing: this.facing, nick: this.nick});
	    }else{
	        this.freeze();
	    }
	    
	    // BOMBS
	    if (!game.physics.arcade.overlap(this, level.bombs) && ctrl.bomb) {
	        socket.emit("place bomb", {x: this.body.position.x, y: this.body.position.y, id: game.time.now, nick: this.nick, slotId: game.slotId});
	    }
	    
	    // console.log('handleCtrlInput', this.body.velocity.x, this.body.velocity.y, ctrl);
	};

	Player.prototype.handleKeysInput = function () {
	    var moving = false;

	    game.physics.arcade.collide(this, level.blockLayer);
	    game.physics.arcade.collide(this, level.bombs);

	    if (game.input.keyboard.isDown(Phaser.Keyboard.LEFT)) {
	        this.body.velocity.x = -this.speed;
	        this.facing = "left";
	        moving = true;
	    } else if (game.input.keyboard.isDown(Phaser.Keyboard.RIGHT)) {
	        this.body.velocity.x = this.speed;
	        this.facing = "right";
	        moving = true;
	    } else {
	        this.body.velocity.x = 0;
	    }
	    
	    if (game.input.keyboard.isDown(Phaser.Keyboard.UP)) {
	        this.body.velocity.y = this.speed;
	        this.facing = "up";
	        moving = true;
	    } else if (game.input.keyboard.isDown(Phaser.Keyboard.DOWN)) {
	        this.body.velocity.y = -this.speed;
	        this.facing = "down";
	        moving = true;
	    } else {
	        this.body.velocity.y = 0;
	    }

	    if (moving) {
	        this.animations.play(this.facing);
	        socket.emit("move player", {x: this.position.x, y: this.position.y, facing: this.facing});
	    } else {
	        this.freeze();
	    }
	};

	Player.prototype.handleBombInput = function () {
	    if (game.input.keyboard.isDown(Phaser.Keyboard.SPACEBAR) && !game.physics.arcade.overlap(this, level.bombs) && !this.bombButtonJustPressed) {
	        this.bombButtonJustPressed = true;
	        socket.emit("place bomb", {x: this.body.position.x, y: this.body.position.y, id: game.time.now, nick: this.nick, slotId: game.slotId});
	    } else if (!game.input.keyboard.isDown(Phaser.Keyboard.SPACEBAR) && this.bombButtonJustPressed) {
	        this.bombButtonJustPressed = false;
	    }
	};

	Player.prototype.freeze = function () {
	    this.body.velocity.x = 0;
	    this.body.velocity.y = 0;
	    this.animations.stop();
	};

	Player.prototype.applySpeedPowerup = function () {
	    this.speed += PLAYER_SPEED_POWERUP_INCREMENT;
	};

	Player.prototype.reset = function () {
	    this.x = this.spawnPoint.x;
	    this.y = this.spawnPoint.y;
	    this.frame = 0;
	    this.facing = "down";
	    this.bombButtonJustPressed = false;
	    this.speed = DEFAULT_PLAYER_SPEED;

	    if (!this.alive) {
	        this.revive();
	    }
	};

	module.exports = Player;

/***/ },
/* 12 */
/***/ function(module, exports, __webpack_require__) {

	/* global Phaser, bomberman */

	var AudioPlayer = __webpack_require__(2);
	var game = bomberman.game;
	var level;

	var Bomb = function (x, y, id) {
	    if(!level){
	        level = bomberman.level;
	    }
	    Phaser.Sprite.call(this, game, x, y, "bomb");
	    this.id = id;

	    this.anchor.setTo(.5, .5);
	    game.physics.enable(this, Phaser.Physics.ARCADE);
	    this.body.immovable = true;
	    this.sizeTween = game.add.tween(this.scale).to({x: 1.2, y: 1.2}, 700, Phaser.Easing.Default, true, 0, true, true);
	    this.animations.add('bomb',[0,1,2],1.5,true);
	    game.add.existing(this);
	    this.animations.play('bomb');
	};

	Bomb.prototype = Object.create(Phaser.Sprite.prototype);

	Bomb.prototype.remove = function () {
	    this.destroy();
	    this.animations.stop();
	    this.sizeTween.stop();
	};

	Bomb.renderExplosion = function (explosions) {
	    console.dir(level.deadGroup);
	    explosions.forEach(function (explosion) {
	        var explosionSprite = new Phaser.Sprite(game, explosion.x, explosion.y, explosion.key, 0);
	        explosionSprite.anchor.setTo(.5, .5);
	        explosionSprite.animations.add("explode");
	        explosionSprite.animations.getAnimation("explode").onComplete.add(function () {
	            level.deadGroup.push(this);
	        }, explosionSprite);

	        game.world.addAt(explosionSprite, 1);

	        explosionSprite.play("explode", 17, false);
	        AudioPlayer.playBombSound();
	    });
	};

	module.exports = Bomb;

/***/ },
/* 13 */
/***/ function(module, exports) {

	/* global Phaser, bomberman */

	var game = bomberman.game;

	var remotePlayerUpdateInterval = 100;

	var RemotePlayer = function (x, y, id, color) {
	    this.id = id;
	    this.previousPosition = {x: x, y: y};
	    this.lastMoveTime = 0;
	    this.targetPosition;
	    this.spawnPoint = {x: x, y: y};
	    Phaser.Sprite.call(this, game, x, y, "bomberman_" + color);
	    game.physics.enable(this, Phaser.Physics.ARCADE);
	    this.anchor.setTo(0.1, 0.6);
	    this.body.setSize(20, 19, 5, 16);
	    this.animations.add('up', [0, 1, 2, 3, 4, 5, 6, 7], 15, true);
	    this.animations.add('down', [8, 9, 10, 11, 12, 13, 14, 15], 15, true);
	    this.animations.add('right', [16, 17, 18, 19, 20, 21, 22, 23], 15, true);
	    this.animations.add('left', [24, 25, 26, 27, 28, 29, 30, 31], 15, true);

	    game.add.existing(this);
	};

	RemotePlayer.prototype = Object.create(Phaser.Sprite.prototype);

	RemotePlayer.prototype.interpolate = function (lastFrameTime) {
	    if (this.distanceToCover && lastFrameTime) {
	        if ((this.distanceCovered.x < Math.abs(this.distanceToCover.x) || this.distanceCovered.y < Math.abs(this.distanceToCover.y))) {
	            var fractionOfTimeStep = (game.time.now - lastFrameTime) / remotePlayerUpdateInterval;
	            var distanceCoveredThisFrameX = fractionOfTimeStep * this.distanceToCover.x;
	            var distanceCoveredThisFrameY = fractionOfTimeStep * this.distanceToCover.y;
	            this.distanceCovered.x += Math.abs(distanceCoveredThisFrameX);
	            this.distanceCovered.y += Math.abs(distanceCoveredThisFrameY);
	            this.position.x += distanceCoveredThisFrameX;
	            this.position.y += distanceCoveredThisFrameY;
	        } else {
	            this.position.x = this.targetPosition.x;
	            this.position.y = this.targetPosition.y;
	        }
	    }
	};

	RemotePlayer.prototype.reset = function () {
	    this.x = this.spawnPoint.x;
	    this.y = this.spawnPoint.y;
	    this.frame = 0;
	    this.previousPosition = {x: this.x, y: this.y};
	    this.distanceToCover = null;
	    this.distanceCovered = null;
	    this.targetPosition = null;
	    this.lastMoveTime = null;

	    if (!this.alive) {
	        this.revive();
	    }
	};

	module.exports = RemotePlayer;

/***/ },
/* 14 */
/***/ function(module, exports, __webpack_require__) {

	/* global Phaser, bomberman */
	var TextConfigurer = __webpack_require__(3);
	var game = bomberman.game;

	var screenWidth = game.width;
	var xOffset = 230 - screenWidth;
	var yOffset = 20;
	var headerXOffset = 280 - screenWidth;
	var headerYOffset = 25;
	var winnerPicXOffset = 360 - screenWidth;
	var winnerPicYOffset = 270;
	var defaultTextXOffset = 350 - screenWidth;
	var defaultTextYOffset = 180;

	var singleWinnerText = "Winner is...";
	var roundEndTieText = "Draw! Winners are...";

	function RoundEndAnimation(game, roundNumber, winningColors) {
		Phaser.Group.call(this, game);
		var roundEndWindow = game.add.image(xOffset, yOffset, "round_end_display");
		var header = game.add.text(headerXOffset, headerYOffset, "Round " + roundNumber + " Complete!");
		TextConfigurer.configureText(header, "white", 32);
		var actualTextXOffset = winningColors.length > 1 ? defaultTextXOffset - 55 : defaultTextXOffset;
		var actualTextToDisplay = winningColors.length > 1 ? roundEndTieText : singleWinnerText;
		var textObject = game.add.text(actualTextXOffset, defaultTextYOffset, actualTextToDisplay);
		TextConfigurer.configureText(textObject, "white", 28);
		textObject.alpha = 0;
		this.add(roundEndWindow);
		this.add(header);
		this.add(textObject);
		
		this.createAndAddWinnerImages(winningColors);
	}

	RoundEndAnimation.prototype = Object.create(Phaser.Group.prototype);

	RoundEndAnimation.prototype.createAndAddWinnerImages = function(winningColors) {
		this.winnerImageIndices = [];
	    var index = 3;

		winningColors.forEach(function(color) {
			var winnerPicImage = new Phaser.Image(game, winnerPicXOffset, winnerPicYOffset, "bomberman_head_" + color);

			winnerPicImage.scale = {x: 1.75, y: 1.75};
			winnerPicImage.alpha = 0;

			game.add.existing(winnerPicImage);
			this.add(winnerPicImage);
			this.winnerImageIndices.push(index++);
		}, this);
	};

	RoundEndAnimation.prototype.beginAnimation = function(callback) {
		var entranceTween = game.add.tween(this);
		entranceTween.to({x: screenWidth}, 300);
		entranceTween.onComplete.addOnce(function() {
			winnerTextTween.start();
		}, this);

		var winnerTextTween = game.add.tween(this.children[2]);
		winnerTextTween.to({alpha: 1}, 800);
		winnerTextTween.onComplete.addOnce(function() {
			winnerDisplayTween.start();
		}, this);

		var exitTween = game.add.tween(this);
		exitTween.to({x: 2 * screenWidth}, 300, Phaser.Easing.Default, false, 200);
		exitTween.onComplete.addOnce(function() {
			callback();
			this.destroy();
		}, this);

		var winnerDisplayTween = this.generateWinnerImageTween(this.winnerImageIndices, exitTween);

		entranceTween.start();
	};

	RoundEndAnimation.prototype.generateWinnerImageTween = function(indices, nextTween) {
		var winnerImageTweens = [];
		var ctx = this;
		for (var i = 0; i < indices.length; i++) {
			(function(n) {
				var tween = game.add.tween(ctx.children[indices[n]]);
				tween.to({alpha: 1}, 900);
				if(i < indices.length - 1) {
					tween.to({alpha: 0}, 900);
					tween.onComplete.addOnce(function() {
						winnerImageTweens[n + 1].start();
					});
				} else {
					tween.onComplete.addOnce(function() {
						nextTween.start();
					}, ctx);
				}
		
				winnerImageTweens.push(tween);
			})(i);
		}

		return winnerImageTweens[0];
	};

	module.exports = RoundEndAnimation;

/***/ },
/* 15 */
/***/ function(module, exports, __webpack_require__) {

	var PowerupIDs = __webpack_require__(9);

	var powerupImageKeys = {};

	powerupImageKeys[PowerupIDs.BOMB_STRENGTH] = "bomb_strength_powerup";
	powerupImageKeys[PowerupIDs.BOMB_CAPACITY] = "bomb_count_powerup";
	powerupImageKeys[PowerupIDs.SPEED] = "speed_powerup";

	module.exports = powerupImageKeys;

/***/ },
/* 16 */
/***/ function(module, exports, __webpack_require__) {

	/* global Phaser, bomberman */

	var PowerupIds = __webpack_require__(9);
	var game = bomberman.game;

	var notificationImageMap = {};
	notificationImageMap[PowerupIds.BOMB_STRENGTH] = "bomb_strength_notification";
	notificationImageMap[PowerupIds.BOMB_CAPACITY] = "bomb_count_notification";
	notificationImageMap[PowerupIds.SPEED] = "speed_notification";

	exports.showPowerupNotification = function(powerupId, playerX, playerY) {
	    var notificationImageKey = notificationImageMap[powerupId];
	    var image = new Phaser.Image(game, playerX, playerY - 10, notificationImageKey);
	    image.anchor.setTo(.5, .5);
	    game.add.existing(image);

	    var upwardMotionTween = game.add.tween(image);
	    upwardMotionTween.to({y: image.y - 30}, 600, Phaser.Easing.Default, true, 0);

	    var fadeTween = game.add.tween(image);
	    fadeTween.to({alpha: 0}, 600, Phaser.Easing.Default, true, 0);
	    
	    upwardMotionTween.onComplete.addOnce(function(obj) {
	      obj.destroy();
	    });
	};

/***/ },
/* 17 */
/***/ function(module, exports, __webpack_require__) {

	/* global Phaser, bomberman */
	var TextConfigurer = __webpack_require__(3);
	var game = bomberman.game,
		airconsole = bomberman.airconsole;

	function GameOver() {
	}

	GameOver.prototype = {
		init: function(winnerColor, winByDefault) {
			this.winnerColor = winnerColor;
			this.winByDefault = winByDefault;
			bomberman.level = undefined;
		},

		create: function() {
			var textToDisplay = this.winByDefault ? "     No other players remaining.\n              You win by default." : "Game Over. Winner: " + this.winnerColor;
			textToDisplay += "\n\nPress Enter to return to main menu.";
			var textObject = game.add.text(game.camera.width / 2, game.camera.height / 2, textToDisplay);
			textObject.anchor.setTo(0.5, 0.5);
			TextConfigurer.configureText(textObject, "white", 28);
			airconsole.broadcast({listener: 'gameState', gameState: 'game_over'});
		},

		update: function() {
			if(game.input.keyboard.isDown(Phaser.Keyboard.ENTER)) {
				this.returnToLobby();
			}
		},

		returnToLobby: function() {
			airconsole.broadcast({listener: 'gameState'});
			game.state.start("Lobby");
		}
	};

	module.exports = GameOver;

/***/ },
/* 18 */
/***/ function(module, exports, __webpack_require__) {

	var map = {
		"./common/map_info.js": 10,
		"./common/powerup_ids.js": 9,
		"./entities/bomb.js": 12,
		"./entities/player.js": 11,
		"./entities/remoteplayer.js": 13,
		"./entities/round_end_animation.js": 14,
		"./states/boot.js": 1,
		"./states/game_over.js": 17,
		"./states/level.js": 8,
		"./states/lobby.js": 5,
		"./states/pending_game.js": 7,
		"./states/preloader.js": 4,
		"./states/stage_select.js": 6,
		"./util/audio_player.js": 2,
		"./util/powerup_image_keys.js": 15,
		"./util/powerup_notification_player.js": 16,
		"./util/text_configurer.js": 3
	};
	function webpackContext(req) {
		return __webpack_require__(webpackContextResolve(req));
	};
	function webpackContextResolve(req) {
		return map[req] || (function() { throw new Error("Cannot find module '" + req + "'.") }());
	};
	webpackContext.keys = function webpackContextKeys() {
		return Object.keys(map);
	};
	webpackContext.resolve = webpackContextResolve;
	module.exports = webpackContext;
	webpackContext.id = 18;


/***/ }
/******/ ]);