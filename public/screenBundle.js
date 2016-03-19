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

	/* global Phaser, AirConsole, io, AirConsoleViewManager */

	// localStorage.debug = '*'; // DEBUGGING socket.io
	// localStorage.clear();

	var bomberman = window.bomberman = {}; // namespace in global
	bomberman.bomberElm = document.getElementById('bomber');

	bomberman.width = bomberman.bomberElm.clientWidth;
	bomberman.height = bomberman.bomberElm.clientHeight;

	var game = bomberman.game = new Phaser.Game(bomberman.width, bomberman.height, Phaser.AUTO, 'bomber');
	bomberman.screen = {};
	bomberman.level = null;
	bomberman.storage = localStorage || {};
	bomberman.device = 'screen';
	var airconsole = new AirConsole();
	bomberman.airconsole = airconsole;
	bomberman.socket = __webpack_require__(12)(io, game);
	bomberman.viewMan = new AirConsoleViewManager(airconsole);
	bomberman.acTools = __webpack_require__(4)(airconsole, bomberman.viewMan, bomberman.device);
	bomberman.vmTools = __webpack_require__(3)(bomberman.viewMan, bomberman.storage, bomberman.device);


	// debug info
	bomberman.acTools.addListener(undefined, function(from, data){
		if(!data.listener || data.listener !== 'movePlayer'){
			console.log('on screen: ', from, data);
		}
	});

	game.state.add("Boot", __webpack_require__(13));
	game.state.add("Preloader", __webpack_require__(16));
	game.state.add("Lobby", __webpack_require__(11));
	game.state.add("StageSelect", __webpack_require__(17));
	game.state.add("PendingGame", __webpack_require__(19));
	game.state.add("Level", __webpack_require__(20));
	game.state.add("GameOver", __webpack_require__(28));

	__webpack_require__(29);


/***/ },
/* 1 */,
/* 2 */,
/* 3 */
/***/ function(module, exports) {

	module.exports = function(viewMan, storage, device){
	  var vmTools = {};
	  vmTools.cbs = {}; // callbacks
	  
	  vmTools.showWithCbs = function(toView){
	    console.log('showWithCbs toView', toView);
	    var fromView = viewMan.current_view.self,
	      fromViewCb = vmTools.cbs[fromView],
	      toViewCb = vmTools.cbs[toView];
	    viewMan.show(toView);
	    storage[device + 'CurrentView'] = toView;
	    if(fromViewCb && fromViewCb.from){
	      fromViewCb.from(toView);
	    }
	    if(toViewCb && toViewCb.to){
	      toViewCb.to(fromView);
	    }
	  };
	  
	  return vmTools;
	};

/***/ },
/* 4 */
/***/ function(module, exports) {

	/* global AirConsole */
	module.exports = function(airconsole, viewMan, devType){
	    var acTools = {};
	    
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
	    acTools.getCurrentView = function(device, cb){
	      if(device === airconsole.getDeviceId()){
	        return viewMan.current_view.self;
	      }
	      airconsole.message(device, {listener: 'currentView'});
	      if(cb)
	       acTools.addListener('currentViewAnswer', cbOnce(cb));
	    };
	    acTools.addListener('currentView', function(device_id){
	      var view = acTools.getCurrentView(airconsole.getDeviceId());
	      airconsole.message(device_id, {listener: 'currentViewAnswer', currentView: view});
	    });
	    
	    if(devType === 'screen'){
	      airconsole.onConnect = function(device_id) {
	      	// deviceConnectionChange();
	      	airconsole.setActivePlayers(20);
	      	console.log('connected: ', arguments);
	      };
	    }
	    
	    airconsole.onMessage = acTools.onMessage;
	    return acTools;
	    
	    function cbOnce(cb){
	      return function(){
	        cb.apply(this, arguments);
	        acTools.rmListener('screenCurrentView');
	      };
	    }
	};

/***/ },
/* 5 */,
/* 6 */,
/* 7 */,
/* 8 */,
/* 9 */,
/* 10 */,
/* 11 */
/***/ function(module, exports) {

	/* global bomberman */
	var game = bomberman.game;
	var socket = bomberman.socket;
	var Lobby = function() {};

	module.exports = Lobby;

	Lobby.prototype = {
	    init: function () {
	        bomberman.vmTools.showWithCbs('lobby');
	        bomberman.airconsole.broadcast({listener: 'gameState', gameState: 'lobby'});
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
	        socket.on("update games", this.updateGames.bind(this));
			socket.emit("enter lobby");
		},

		update: function() {
		},

		updateGames: function(games) {
			var htmlGamesElm = document.getElementById('slots');
			var htmlGameElm = htmlGamesElm.children[0].cloneNode(true);
			htmlGamesElm.innerHTML = '';
			
			var names = Object.keys(games);
	        for (var i = 0; i < names.length; i++) {
	        	var gme = games[names[i]];
		        var settings = this.stateSettings[gme.state];
		        var callback = (function (gameId, sett) {
		            return function(){
		            	if (sett.callback != null){
		                	sett.callback(gme);
		            	}
		            };
		        })(gme, settings);
	        	
	        	var newGameElm = htmlGameElm.cloneNode(true);
	        	newGameElm.innerHTML = settings.text + (gme.numOfPlayers ? "(" + gme.numOfPlayers +")" : "");
	        	newGameElm.addEventListener("click", callback);
	        	htmlGamesElm.appendChild(newGameElm);
	        }
		},

		hostGameAction: function() {
			bomberman.storage.gameId = socket.id;
			bomberman.storage.screenId = socket.id;
			socket.removeAllListeners();
			socket.emit("host game", {gameId: socket.id, screenId: socket.id});
	        game.state.start("StageSelect", true, false);
		},

		joinGameAction: function(gme) {
			bomberman.storage.gameId = gme.gameId;
			bomberman.storage.screenId = socket.id;
			socket.removeAllListeners();
	        game.state.start("PendingGame", true, false, gme.tilemapName, gme.gameId);
		}
	};

/***/ },
/* 12 */
/***/ function(module, exports) {

	/* global bomberman */
	module.exports = function(io, game){
	  function getURLParameter(name) {
	    return decodeURIComponent((new RegExp('[?|&]' + name + '=' + '([^&;]+?)(&|#|;|$)').exec(location.search)||[,""])[1].replace(/\+/g, '%20'))||null;
	  }
	  
	  var once = false;
	  var socketServer;
	  var socket;
	  if(getURLParameter('cloud9')){
	      socketServer = 'cloud9';
	      socket = io(); // cloud9
	  }else{
	      socketServer = 'openshift';
	      socket = io('http://airbomber-luckylooke.rhcloud.com:8000'); // openshift
	  }
	  socket.on('connect_error', function(err){
	      if(!once){ // try once fallback to cloud9
	          socket = io(); // cloud9
	          socketServer = 'cloud9';
	          once = true;
	      }else{
	          console.log('SOCKET CANNOT CONNECT', err);
	      }
	  });
	  socket.on('connect', function(){
	      console.log('socket server: ', socketServer);
	      game.state.start('Boot');
	  });
	  return socket;
	};

/***/ },
/* 13 */
/***/ function(module, exports, __webpack_require__) {

	/* global bomberman */
	var AudioPlayer = __webpack_require__(14);
	var TextConfigurer = __webpack_require__(15);
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
/* 14 */
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
/* 15 */
/***/ function(module, exports) {

	exports.configureText = function(text, color, size) {
		text.font = "Carter One";
		text.fill = color;
		text.fontSize = size;
	};

/***/ },
/* 16 */
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

	        this.load.spritesheet("bomberman_white", "resource/bomberman.png", 32, 64);
	        this.load.spritesheet("bomberman_black", "resource/bomberman_black.png", 32, 64);
	        this.load.spritesheet("bomberman_blue", "resource/bomberman_blue.png", 32, 64);
	        this.load.spritesheet("bomberman_red", "resource/bomberman_red.png", 32, 64);
	        this.load.spritesheet("bomberman_lightblue", "resource/bomberman_lightblue.png", 32, 64);
		    this.load.spritesheet("bomberman_yellow", "resource/bomberman_yellow.png", 32, 64);
		    this.load.spritesheet("bomberman_purple", "resource/bomberman_purple.png", 32, 64);
		    this.load.spritesheet("bomberman_green", "resource/bomberman_green.png", 32, 64);
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
	        this.load.tilemap("GreenField", "assets/levels/GreenField.json", null, Phaser.Tilemap.TILED_JSON);
	        this.load.tilemap("GreenHell", "assets/levels/GreenHell.json", null, Phaser.Tilemap.TILED_JSON);
	        this.load.tilemap("DesertGraveyard", "assets/levels/DesertGraveyard.json", null, Phaser.Tilemap.TILED_JSON);
	        this.load.image("tiles", "resource/tileset.png");
	        this.load.image("desertTiles", "resource/desert-tileset.png");
	        this.load.image("select_stase", "resource/select_stage.png");
	        // this.load.image("first_", "assets/levels/thumbnails/danger_desert_thumbnail.png");
	        // this.load.image("danger_desert_thumbnail", "assets/levels/thumbnails/danger_desert_thumbnail.png");
	        this.load.image("pending_game_backdrop", "resource/lobby_backdrop.png");
	        this.load.image("round_end_display", "resource/end_of_round_window.png");
	        this.load.image("bomberman_head_white", "resource/icon_white.png");
	        this.load.image("bomberman_head_blue", "resource/icon_blue.png");
	        this.load.image("bomberman_head_green", "resource/icon_green.png");
	        this.load.image("bomberman_head_purple", "resource/icon_purple.png");
	        this.load.image("bomberman_head_red", "resource/icon_red.png");
	        this.load.image("bomberman_head_black", "resource/icon_black.png");
	        this.load.image("bomberman_head_lightblue", "resource/icon_lightblue.png");
	        this.load.image("bomberman_head_yellow", "resource/icon_yellow.png");
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
	        if (bomberman.storage[bomberman.device + 'CurrentView']) {
	            switch (bomberman.storage[bomberman.device + 'CurrentView']) {
	                case 'level':
	                    game.state.start("Level");
	                    break;
	                
	                default:
	                    game.state.start("Lobby");
	            }
	        }else{
	            game.state.start("Lobby");
	        }
	    }
	};


/***/ },
/* 17 */
/***/ function(module, exports, __webpack_require__) {

	/* global bomberman */
	var MapInfo = __webpack_require__(18);
	var game = bomberman.game;
	var socket = bomberman.socket;
	var StageSelect = function() {};

	module.exports = StageSelect;

	var stages = MapInfo;

	StageSelect.prototype = {
	    init: function () {
	        bomberman.vmTools.showWithCbs('stage-select');
		},

		create: function() {
			var htmlStagesElm = document.getElementById('stages');
			var htmlStageElm = htmlStagesElm.children[0].cloneNode(true);
			var completeStages = [];
			var arrow_left = document.getElementById('arrow-left');
			var arrow_right = document.getElementById('arrow-right');
			var stageSelectElement = document.getElementById('stage-select');
			var pendingGameElement = document.getElementById('pending-game');
			var currentStage = 0;
			htmlStagesElm.innerHTML = '';
			
			var stage,
				newStageElm;
	        
	        for (var i in stages) {
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
	        bomberman.selectedStage = completeStages[0];
	        completeStages[0].classList.remove("hidden");
			
			arrow_left.addEventListener('click',function(f){
				changeMap('left');
			})
			
			arrow_right.addEventListener('click',function(f){
				changeMap('right');
			})
			
			function changeMap(direction){
			completeStages[currentStage].classList.add("hidden");
				
				if(direction == 'right'){
					currentStage++;
					if(currentStage >= completeStages.length)
					currentStage = 0;
				}
				else if (direction == 'left'){
					currentStage--;
					if(currentStage < 0)
					currentStage = completeStages.length - 1;
				}
				
				bomberman.selectedStage = completeStages[currentStage];
				
				stageSelectElement.style.backgroundImage = "url(" + completeStages[currentStage].background + ")";	
				completeStages[currentStage].classList.remove("hidden");
			}
		},

		update: function() {
		},

		getHandler: function(index) {
			return function confirmStageSelection(){
		        socket.emit("select stage", {gameId: bomberman.storage.gameId, tilemapName: stages[index].tilemapName});
		        game.state.start("PendingGame", true, false, stages[index].tilemapName, bomberman.storage.gameId);
			};
		}
		
		
		
	};


/***/ },
/* 18 */
/***/ function(module, exports) {

	var MapInfo = {
		GreenField: {
			name: "Green Field",
			thumbnailFile: "../resource/green_field_thumbnail.png",
			tilemapName: "GreenField",
			maxPlayers: 4,
			size: "Small",
			background:"../resource/green_field_background.png",
			spawnLocations: [{x: 1, y: 1}, {x: 23, y: 1}, {x: 1, y: 13}, {x: 23, y: 13}],
			collisionTiles: [3, 4],
			groundLayer: "Ground",
			blockLayer: "Blocks",
			tilesetName: "tiles",
			tilesetImage: "tiles",
			destructibleTileId: 4
		},
		GreenHell: {
			name: "Green Hell",
			thumbnailFile: "../resource/green_hell_thumbnail.png",
			tilemapName: "GreenHell",
			maxPlayers: 4,
			size: "Small",
			background:"../resource/green_hell_background.png",
			spawnLocations: [{x: 1, y: 1}, {x: 23, y: 1}, {x: 1, y: 13}, {x: 23, y: 13}],
			collisionTiles: [3, 4],
			groundLayer: "Ground",
			blockLayer: "Blocks",
			tilesetName: "tiles",
			tilesetImage: "tiles",
			destructibleTileId: 4
		},
		DesertGraveyard: {
			name: "Desert2",
			thumbnailFile: "../resource/desert_graveyard_thumbnail.png",
			tilemapName: "DesertGraveyard",
			maxPlayers: 4,
			size: "Small",
			background:"../resource/desert_graveyard_background.png",
			spawnLocations: [{x: 11, y: 6}, {x: 13, y: 6}, {x: 11, y: 8}, {x: 13, y: 8}],
			collisionTiles: [3, 4],
			groundLayer: "Ground",
			blockLayer: "Blocks",
			tilesetName: "desertTiles",
			tilesetImage: "desertTiles",
			destructibleTileId: 4
		}
	};

	module.exports = MapInfo;

/***/ },
/* 19 */
/***/ function(module, exports, __webpack_require__) {

	/* global bomberman */
	var MapInfo = __webpack_require__(18);
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
	    	document.getElementById('leaveGameBtn').addEventListener("click", this.bindedLeaveGameAction);
			
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
	        	newPlayerElm.children[4].innerHTML = 'Connected: ' + player.connection;
	        	newPlayerElm.children[5].innerHTML = 'Ready: ' + player.ready;
	        	if(bomberman.masterScreen){
	        		newPlayerElm.children[6].addEventListener('click', this.kickPlayer.bind(player));
	        		newPlayerElm.children[6].classList.remove('hidden');
	        	}
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
			socket.emit("leave pending game", {gameId: storage.gameId, screenId: storage.screenId});
			socket.removeAllListeners();
	        game.state.start("Lobby");
		},
		
		leavingPendingGame: function(){
			if(bomberman.masterScreen){
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

/***/ },
/* 20 */
/***/ function(module, exports, __webpack_require__) {

	/* global Phaser, bomberman */
	var BLACK_HEX_CODE = "#000000";
	var TILE_SIZE = 35;

	var PowerupIDs = __webpack_require__(21);
	var MapInfo = __webpack_require__(18);
	var AudioPlayer = __webpack_require__(14);
	var Player = __webpack_require__(22);
	var RemotePlayer = __webpack_require__(23);
	var Bomb = __webpack_require__(24);
	var RoundEndAnimation = __webpack_require__(25);
	var PowerupImageKeys = __webpack_require__(26);
	var PowerupNotificationPlayer = __webpack_require__(27);
	var game = bomberman.game;
	var socket = bomberman.socket;
	var level = bomberman.level;
	var screen = bomberman.screen;
	var storage = bomberman.storage;

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
	        if (!data) {
	            if (storage.gameId && storage.screenId) {
	                game.paused = true;
	                socket.on('screen reconnected', this.onReconnected.bind(this));
	                socket.emit('screen reconnect', {gameId: storage.gameId, screenId: storage.screenId});
	            } else {
	                game.state.start("Lobby");
	                return;
	            }
	        }else{
	            this.tilemapName = data.tilemapName;
	            bomberman.players = this.players = data.players;
	        }
	        bomberman.vmTools.showWithCbs('level');
	        this.bindedPauseGameAction = this.pauseGameAction.bind(this);
	    	document.getElementById('pauseGameBtn').addEventListener("click", this.bindedPauseGameAction);
	    	
	        airconsole.onDisconnect = function(device_id){
	            console.log('onDisconnect', device_id, bomberman.players);
	            for (var nick in bomberman.players) {
	                var player = bomberman.players[nick];
	                if(player.device_id === device_id && player.screenId === storage.screenId){
	                    player.connection = false;
	                    socket.emit("pause game", {gameId: storage.gameId, screenId: storage.screenId});
	                }
	            }
	        };
	        airconsole.onConnect = function(device_id){
	            console.log('onConnect', device_id);
	            airconsole.message(device_id, {listener: 'reconnect'});
	        };
	        acTools.addListener('reconnect', function(device_id, data){
	            console.log('reconnection: ', data, bomberman);
	            for (var nick in bomberman.players) {
	                console.log('nick: ', nick);
	                if(nick === data.nick){
	                    console.log('found so resume');
	                    var player = bomberman.players[nick];
	                    player.device_id = device_id;
	                    player.connection = true;
	                    socket.emit("resume game", {gameId: storage.gameId, screenId: storage.screenId});
	                }
	            }
	            console.log('storage.screenCurrentView', storage.screenCurrentView);
	            airconsole.message(device_id, {listener: 'gameState', gameState: storage.screenCurrentView});
	        });
	    },

	    setEventHandlers: function () {
	        socket.on("disconnect", this.onSocketDisconnect.bind(this));
	        socket.on("reconnected", this.onReconnected.bind(this));
	        socket.on("move player", this.onMovePlayer.bind(this));
	        socket.on("remove player", this.onRemovePlayer.bind(this));
	        socket.on("kill player", this.onKillPlayer.bind(this));
	        socket.on("place bomb", this.onPlaceBomb.bind(this));
	        socket.on("detonate", this.onDetonate.bind(this));
	        socket.on("new round", this.onNewRound.bind(this));
	        socket.on("pause game", this.onPauseGame.bind(this));
	        socket.on("resume game", this.onResumeGame.bind(this));
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
	        game.physics.enable(this.bombs, Phaser.Physics.ARCADE);
	        this.items = {};

	        this.setEventHandlers();
	        this.initializePlayers();

	        if(!game.paused){
	            this.createDimGraphic();
	            this.beginRoundAnimation("round_1");
	        }
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

	    pauseGameAction: function () {
	        if(game.paused){
	            socket.emit("resume game", {gameId: storage.gameId, screenId: storage.screenId});
	        }else{
	            socket.emit("pause game", {gameId: storage.gameId, screenId: storage.screenId});
	        }
	    },

	    onPauseGame: function (data) {
	        if(game.paused){
	            return;
	        }
	        this.createDimGraphic();
	        this.gameFrozen = true;
	        game.paused = true;
	        AudioPlayer.stopMusicSound();
	    },

	    onResumeGame: function (data) {
	        if(!game.paused){
	            return;
	        }
	        if(this.dimGraphic){
	            this.dimGraphic.destroy();
	        }
	        this.gameFrozen = false;
	        game.paused = false;
	        AudioPlayer.playMusicSound();
	    },
	    
	    onReconnected: function (data) {
	        if(!data){
	            game.paused = false;
	            game.state.start("Lobby");
	            return;
	        }
	        this.onPauseGame();
	        this.tilemapName = data.tilemapName;
	        bomberman.players = this.players = data.players;
	        screen.players = data.screenPlayers;
	        this.initializeMap(data.mapData, data.placedBombs);
	        this.initializePlayers();
	        socket.emit("resume game", {gameId: storage.gameId, screenId: storage.screenId});
	    },

	    onEndGame: function (data) {
	        this.createDimGraphic();
	        this.gameFrozen = true;
	        var animation = new RoundEndAnimation(game, data.completedRoundNumber, data.roundWinnerColors);
	        var tilemapName = this.tilemapName;
	        animation.beginAnimation(function () {
	            controllers = {};
	            game.state.start("GameOver", true, false, data.gameWinner, false, tilemapName);
	        });
	        AudioPlayer.stopMusicSound();
	    },

	    onNoOpponentsLeft: function (data) {
	        controllers = {};
	        game.state.start("GameOver", true, false, data, true, this.tilemapName);
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
	                            socket.emit("powerup overlap", {x: item.x, y: item.y, nick: player.nick, gameId: storage.gameId});
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
	        this.onPauseGame();
	        console.log("Disconnected from socket server.");
	    },

	    initializePlayers: function () {
	        if(!this.players){
	            return;
	        }
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

	    initializeMap: function (mapData, placedBombs) {
	        if(!this.tilemapName){
	            return;
	        }
	        this.map = game.add.tilemap(this.tilemapName);
	        var mapInfo = MapInfo[this.tilemapName];

	        this.map.addTilesetImage(mapInfo.tilesetName, mapInfo.tilesetImage, 35, 35);
	        this.groundLayer = new Phaser.TilemapLayer(game, this.map, this.map.getLayerIndex(mapInfo.groundLayer), game.width, game.height);
	        game.world.addAt(this.groundLayer, 0);
	        this.groundLayer.resizeWorld();
	        this.blockLayer = new Phaser.TilemapLayer(game, this.map, this.map.getLayerIndex(mapInfo.blockLayer), game.width, game.height);
	        game.physics.arcade.enable(this.blockLayer);
	        game.world.addAt(this.blockLayer, 1);
	        this.blockLayer.resizeWorld();
	        this.map.setCollision(mapInfo.collisionTiles, true, mapInfo.blockLayer);
	        var blockLayerData = game.cache.getTilemapData(this.tilemapName).data.layers[1];
	        if(mapData){
	            for (var y = 0; y < mapData.length; y++) {
	                var row = mapData[y];
	                for (var x = 0; x < row.length; x++) {
	                    if(row[x] === 0){
	                        this.map.removeTile(x, y, 1);
	                    }
	                    if(placedBombs[y][x] != 0){
	                        this.bombs.add(new Bomb(x * TILE_SIZE + TILE_SIZE / 2, y * TILE_SIZE + TILE_SIZE / 2, placedBombs[y][x]));
	                    }
	                }
	            }
	        }else{
	            socket.emit("register map", {
	                tiles: blockLayerData.data,
	                height: blockLayerData.height,
	                width: blockLayerData.width,
	                destructibleTileId: mapInfo.destructibleTileId,
	                gameId: storage.gameId
	            });
	        }
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
/* 21 */
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
/* 22 */
/***/ function(module, exports) {

	/* global Phaser, bomberman */

	var game = bomberman.game;
	var storage = bomberman.storage;
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
	        socket.emit("place bomb", {x: this.body.position.x, y: this.body.position.y, id: game.time.now, nick: this.nick, gameId: storage.gameId});
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
	        socket.emit("move player", {x: this.position.x, y: this.position.y, facing: this.facing, nick: this.nick});
	    } else {
	        this.freeze();
	    }
	};

	Player.prototype.handleBombInput = function () {
	    if (game.input.keyboard.isDown(Phaser.Keyboard.SPACEBAR) && !game.physics.arcade.overlap(this, level.bombs) && !this.bombButtonJustPressed) {
	        this.bombButtonJustPressed = true;
	        socket.emit("place bomb", {x: this.body.position.x, y: this.body.position.y, id: game.time.now, nick: this.nick, gameId: storage.gameId});
	    } else if (!game.input.keyboard.isDown(Phaser.Keyboard.SPACEBAR) && this.bombButtonJustPressed) {
	        this.bombButtonJustPressed = false;
	    }
	};

	Player.prototype.freeze = function () {
	    this.body.velocity.x = 0;
	    this.body.velocity.y = 0;
	    this.animations.stop();
	    socket.emit("move player", {x: this.position.x, y: this.position.y, facing: this.facing, nick: this.nick});
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
/* 23 */
/***/ function(module, exports) {

	/* global Phaser, bomberman */

	var game = bomberman.game;

	var remotePlayerUpdateInterval = 100;

	var RemotePlayer = function (x, y, nick, color) {
	    this.nick = nick;
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
/* 24 */
/***/ function(module, exports, __webpack_require__) {

	/* global Phaser, bomberman */

	var AudioPlayer = __webpack_require__(14);
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
/* 25 */
/***/ function(module, exports, __webpack_require__) {

	/* global Phaser, bomberman */
	var TextConfigurer = __webpack_require__(15);
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
/* 26 */
/***/ function(module, exports, __webpack_require__) {

	var PowerupIDs = __webpack_require__(21);

	var powerupImageKeys = {};

	powerupImageKeys[PowerupIDs.BOMB_STRENGTH] = "bomb_strength_powerup";
	powerupImageKeys[PowerupIDs.BOMB_CAPACITY] = "bomb_count_powerup";
	powerupImageKeys[PowerupIDs.SPEED] = "speed_powerup";

	module.exports = powerupImageKeys;

/***/ },
/* 27 */
/***/ function(module, exports, __webpack_require__) {

	/* global Phaser, bomberman */

	var PowerupIds = __webpack_require__(21);
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
/* 28 */
/***/ function(module, exports, __webpack_require__) {

	/* global Phaser, bomberman */
	var MapInfo = __webpack_require__(18);
	var game = bomberman.game,
		airconsole = bomberman.airconsole;

	function GameOver() {
	}

	GameOver.prototype = {
		init: function(winner, winByDefault, tilemapName) {
			document.getElementById('game-over').style.backgroundImage = "url(" + MapInfo[tilemapName].background + ")";
			document.getElementById('game-over').addEventListener('click', this.returnToLobby);
			this.winner = winner;
			this.winByDefault = winByDefault;
			bomberman.level = undefined;
	        bomberman.vmTools.showWithCbs('game-over');
		},

		create: function() {
			var textToDisplay = this.winByDefault ? "     No other players remaining.\n" + this.winner.nick + " win by default." : "Winner: " + this.winner.nick;
			textToDisplay += "\n\nPress Enter or Tap/Click anywhere to return to main menu.";
			document.getElementById('game-over-text').innerHTML = textToDisplay;
			document.getElementById('winner').children[0].setAttribute('src', './resource/icon_' + this.winner.color + '.png');
			airconsole.broadcast({listener: 'gameState', gameState: 'game-over'});
		},

		update: function() {
			if(game.input.keyboard.isDown(Phaser.Keyboard.ENTER)) {
				this.returnToLobby();
			}
		},

		returnToLobby: function() {
			game.state.start("Lobby");
		}
	};

	module.exports = GameOver;

/***/ },
/* 29 */
/***/ function(module, exports, __webpack_require__) {

	var map = {
		"./common/map_info.js": 18,
		"./common/powerup_ids.js": 21,
		"./entities/bomb.js": 24,
		"./entities/player.js": 22,
		"./entities/remoteplayer.js": 23,
		"./entities/round_end_animation.js": 25,
		"./states/boot.js": 13,
		"./states/game_over.js": 28,
		"./states/level.js": 20,
		"./states/lobby.js": 11,
		"./states/pending_game.js": 19,
		"./states/preloader.js": 16,
		"./states/stage_select.js": 17,
		"./util/audio_player.js": 14,
		"./util/powerup_image_keys.js": 26,
		"./util/powerup_notification_player.js": 27,
		"./util/text_configurer.js": 15
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
	webpackContext.id = 29;


/***/ }
/******/ ]);