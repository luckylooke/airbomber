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

        window.game = new Phaser.Game(875, 525, Phaser.AUTO, 'bomber');
	window.player = null;
	window.socket = null;
	window.level = null;

	startGame();

	function startGame() {
	    socket = io();

        game.state.add("Boot", __webpack_require__(1));
        game.state.add("Preloader", __webpack_require__(4));
        game.state.add("Lobby", __webpack_require__(5));
        game.state.add("StageSelect", __webpack_require__(6));
        game.state.add("PendingGame", __webpack_require__(7));
        game.state.add("Level", __webpack_require__(8));
        game.state.add("GameOver", __webpack_require__(17));

		game.state.start('Boot');
	};

/***/ },
/* 1 */
/***/ function(module, exports, __webpack_require__) {

        var AudioPlayer = __webpack_require__(2);
        var TextConfigurer = __webpack_require__(3);

        var textXOffset = 420;
        var textYOffset = 200;

        var Boot = function () {
        };

        module.exports = Boot;

        Boot.prototype = {

            preload: function () {
            },

            create: function () {
                game.stage.disableVisibilityChange = true;
                game.input.maxPointers = 1;
                AudioPlayer.initialize();
                if (game.device.desktop) {
                    game.stage.scale.pageAlignHorizontally = true;
                    game.state.start('Preloader');
                } else {
                    var text = game.add.text(textXOffset, textYOffset, 'Please run the game on your computer');
                    TextConfigurer.configureText(text, "white", 45);
                    text.anchor.setTo(.5, .5);
                }
            }
        };


        /***/
    },
    /* 2 */
    /***/ function (module, exports, __webpack_require__) {

        var bombSound;
        var powerupSound;
        var musicSound;

        module.exports = {
            initialize: function () {
                bombSound = game.add.audio("explosion");
                powerupSound = game.add.audio("powerup");
                musicSound = game.add.audio("music", 0.5);
            },

            playBombSound: function () {
                bombSound.play();
		},

            playPowerupSound: function () {
                powerupSound.play();
            },

            playMusicSound: function () {
                musicSound.play();
            },
            stopMusicSound: function () {
                musicSound.stop();
            }
        };

/***/ },
    /* 3 */
/***/ function(module, exports, __webpack_require__) {

        exports.configureText = function (text, color, size) {
            text.font = "Carter One";
            text.fill = color;
            text.fontSize = size;
	};

/***/ },
    /* 4 */
/***/ function(module, exports, __webpack_require__) {

        var Preloader = function () {
        };

        module.exports = Preloader;

	Preloader.prototype = {

        preload: function () {
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
            this.load.tilemap("levelTwo", "assets/levels/Arena_map.json", null, Phaser.Tilemap.TILED_JSON);
            this.load.image("tiles", "resource/tileset.png");
            this.load.image("select_stage", "resource/select_stage.png");
            this.load.image("first_", "assets/levels/thumbnails/first_.png");
            this.load.image("danger_desert_thumbnail", "assets/levels/thumbnails/danger_desert_thumbnail.png");
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
            this.load.image("background", "resource/Background_1.png");
            this.load.image("background_b", "resource/Background_button.png");
            this.load.image("background_s", "resource/Background_select.png");

            this.load.audio("explosion", "assets/sounds/bomb.ogg");
            this.load.audio("powerup", "assets/sounds/powerup.ogg");
            this.load.audio("music", "assets/sounds/music.ogg");
        },

        create: function () {
            game.state.start("Lobby");
        }
	};


/***/ },
    /* 5 */
/***/ function(module, exports, __webpack_require__) {

	var Lobby = function() {};
        var TextConfigurer = __webpack_require__(3);

        var initialSlotYOffset = 350;
        var slotXOffset = 155;
	var lobbySlotDistance = 60;
	var textXOffset = 260;
	var textYOffset = 25;

	module.exports = Lobby;

	Lobby.prototype = {
        init: function () {
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
            game.add.sprite(0, 0, 'background');
            this.backdrop = game.add.image(130, 300, "background_b");
			this.slots = [];
			this.labels = [];
			var gameData = [{state: "empty"}, {state: "empty"}, {state: "joinable"}, {state: "insession"}];
			socket.emit("enter lobby");
            socket.on("add slots", this.addSlots.bind(this));
            socket.on("update slot", this.updateSlot.bind(this));
		},

		update: function() {
		},

		addSlots: function(gameData) {
            var state = gameData.state;
            var settings = this.stateSettings[state];
            callback = function () {
                if (settings.callback != null)
                    settings.callback(1);
            };
            var slotYOffset = initialSlotYOffset + lobbySlotDistance;
            this.slots = game.add.button(slotXOffset, slotYOffset, "game_slot", callback, null, settings.overFrame, settings.outFrame);
            var text = game.add.text(slotXOffset + textXOffset, slotYOffset + textYOffset, settings.text);
            TextConfigurer.configureText(text, "white", 18);
            text.anchor.setTo(.5, .5);
            this.labels = text;
		},

		hostGameAction: function(gameId) {
			socket.emit("host game", {gameId: gameId});
			socket.removeAllListeners();
            game.state.start("StageSelect", true, false, gameId);
		},

		joinGameAction: function(gameId) {
			socket.removeAllListeners();
            game.state.start("PendingGame", true, false, null, gameId);
		},

		updateSlot: function(updateInfo) {
			var settings = this.stateSettings[updateInfo.newState];
			var id = updateInfo.gameId;
            var button = this.slots;
            this.labels.setText(settings.text);
			button.setFrames(settings.overFrame, settings.outFrame);
			button.onInputUp.removeAll();
			button.onInputUp.add(function() { return settings.callback(id)}, this);
		}
	};

/***/ },
    /* 6 */
/***/ function(module, exports, __webpack_require__) {

        var StageSelect = function () {
        };

        module.exports = StageSelect;

        var xOffset = 180;
        var yOffset = 25;
        var thumbnailXOffset = 396;
        var thumbnailYOffset = 125;
        var stageNameYOffset = 320;

        var stages = {name: "Comeback", thumbnailKey: "first_", tilemapName: "First", maxPlayers: 4, size: "medium"};

        StageSelect.prototype = {
            init: function (gameId) {
                this.gameId = gameId;
            },

            create: function () {
                game.add.sprite(0, 0, 'background_s');
                var selectionWindow = game.add.image(xOffset, yOffset, "select_stage");
                this.okButton = game.add.button(625, 425, "ok_button", this.confirmStageSelection, this, 1, 0);
                this.thumbnail = game.add.image(thumbnailXOffset, thumbnailYOffset, stages.thumbnailKey);
                this.text = game.add.text(game.camera.width / 2, stageNameYOffset, stages.name);
                this.configureText(this.text, "white", 28);
                this.text.anchor.setTo(.5, .5);
                this.numPlayersText = game.add.text(360, 380, "Max # of players:   " + stages.maxPlayers);
                this.configureText(this.numPlayersText, "white", 18);
                this.stageSizeText = game.add.text(360, 410, "Map size:   " + stages.size);
                this.configureText(this.stageSizeText, "white", 18);
            },

            update: function () {
            },

            configureText: function (text, color, size) {
                text.font = "Carter One";
                text.fill = color;
                text.fontSize = size;
            },

            confirmStageSelection: function () {
                socket.emit("select stage", {mapName: stages.tilemapName});
                game.state.start("PendingGame", true, false, stages.tilemapName, this.gameId);
            }
        };

        /***/
    },
    /* 7 */
    /***/ function (module, exports, __webpack_require__) {

        var TextConfigurer = __webpack_require__(3);

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

/***/ },
    /* 8 */
/***/ function(module, exports, __webpack_require__) {

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

        var Level = function () {
        };

	module.exports = Level;

	Level.prototype = {
        remotePlayers: {},

        gameFrozen: true,

        init: function (tilemapName, players, id) {
            this.tilemapName = 'First';
            //console.log(this.tilemapName + '||' + players + "||" + id);
            this.players = players;
            this.playerId = id;
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

            player.reset();
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
                game.state.start("GameOver", true, false, data.gameWinnerColor, false);
            });
            AudioPlayer.stopMusicSound();
        },

        onNoOpponentsLeft: function (data) {
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
            if (player != null && player.alive == true) {
                if (this.gameFrozen) {
                    player.freeze();
                } else {
                    player.handleInput();
                    for (var itemKey in this.items) {
                        var item = this.items[itemKey];
                        game.physics.arcade.overlap(player, item, function (p, i) {
                            socket.emit("powerup overlap", {x: item.x, y: item.y});
                        });
                    }
                }
            }

            this.stopAnimationForMotionlessPlayers();
            this.storePreviousPositions();

            for (var id in this.remotePlayers) {
                this.remotePlayers[id].interpolate(this.lastFrameTime);
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
                game.debug.body(player);
            }
        },

        storePreviousPositions: function () {
            for (var id in this.remotePlayers) {
                remotePlayer = this.remotePlayers[id];
                remotePlayer.previousPosition = {x: remotePlayer.position.x, y: remotePlayer.position.y};
            }
        },

        stopAnimationForMotionlessPlayers: function () {
            for (var id in this.remotePlayers) {
                remotePlayer = this.remotePlayers[id];
                if (remotePlayer.lastMoveTime < game.time.now - 200) {
                    remotePlayer.animations.stop();
                }
            }
        },

        onSocketDisconnect: function () {
            console.log("Disconnected from socket server.");
            socket.broadcast.emit("remove player", {id: this.id});
        },

        initializePlayers: function () {
            for (var i in this.players) {
                var data = this.players[i];
                if (data.id == this.playerId) {
                    player = new Player(data.x, data.y, data.id, data.color);
                } else {
                    this.remotePlayers[data.id] = new RemotePlayer(data.x, data.y, data.id, data.color);
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
                destructibleTileId: mapInfo.destructibleTileId
            });
        },

        onMovePlayer: function (data) {
            if (player && data.id == player.id || this.gameFrozen) {
                return;
            }
            var movingPlayer = this.remotePlayers[data.id];
            if (movingPlayer.targetPosition) {
                if (data.x == movingPlayer.targetPosition.x && data.y == movingPlayer.targetPosition.y) {
                    return;
                }
                movingPlayer.animations.play(data.facing);
                movingPlayer.position.x = movingPlayer.targetPosition.x;
                movingPlayer.position.y = movingPlayer.targetPosition.y;
                movingPlayer.distanceToCover = {
                    x: data.x - movingPlayer.targetPosition.x,
                    y: data.y - movingPlayer.targetPosition.y
                };
                movingPlayer.distanceCovered = {x: 0, y: 0};
            }
            movingPlayer.targetPosition = {x: data.x, y: data.y};
            movingPlayer.lastMoveTime = game.time.now;
        },

        onRemovePlayer: function (data) {
            var playerToRemove = this.remotePlayers[data.id];
            if (playerToRemove.alive) {
                playerToRemove.destroy();
            }

            delete this.remotePlayers[data.id];
            delete this.players[data.id];
        },

        onKillPlayer: function (data) {
            if (data.id == player.id) {

                player.kill();
            } else {
                var playerToRemove = this.remotePlayers[data.id];

                playerToRemove.kill();
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
        },

        onPowerupAcquired: function (data) {
            this.items[data.powerupId].destroy();
            delete this.items[data.powerupId];

            if (data.acquiringPlayerId === player.id) {
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
/***/ function(module, exports, __webpack_require__) {

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
/***/ function(module, exports, __webpack_require__) {

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
		levelTwo: {
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

        var Bomb = __webpack_require__(12);

        var DEFAULT_PLAYER_SPEED = 250;
        var PLAYER_SPEED_POWERUP_INCREMENT = 25;

        var Player = function (x, y, id, color) {
            Phaser.Sprite.call(this, game, x, y, "bomberman_" + color);

            this.spawnPoint = {x: x, y: y};
            this.id = id;
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

        Player.prototype.handleInput = function () {
            this.handleMotionInput();
            this.handleBombInput();
	};

        Player.prototype.handleMotionInput = function () {
            var moving = true;

	    game.physics.arcade.collide(this, level.blockLayer);
	    game.physics.arcade.collide(this, level.bombs);

            if (game.input.keyboard.isDown(Phaser.Keyboard.LEFT)) {
                this.body.velocity.y = 0;
                this.body.velocity.x = -this.speed;
                this.facing = "left";
            } else if (game.input.keyboard.isDown(Phaser.Keyboard.RIGHT)) {
                this.body.velocity.y = 0;
                this.body.velocity.x = this.speed;
                this.facing = "right";
            } else if (game.input.keyboard.isDown(Phaser.Keyboard.UP)) {
                this.body.velocity.x = 0;
                this.body.velocity.y = -this.speed;
                this.facing = "up";
            } else if (game.input.keyboard.isDown(Phaser.Keyboard.DOWN)) {
                this.body.velocity.x = 0;
                this.body.velocity.y = this.speed;
                this.facing = "down";
            } else {
                moving = false;
                this.freeze();
            }

            if (moving) {
                this.animations.play(this.facing);
                socket.emit("move player", {x: this.position.x, y: this.position.y, facing: this.facing});
	    }
        };

        Player.prototype.handleBombInput = function () {
            if (game.input.keyboard.isDown(Phaser.Keyboard.SPACEBAR) && !game.physics.arcade.overlap(this, level.bombs) && !this.bombButtonJustPressed) {
                this.bombButtonJustPressed = true;
                socket.emit("place bomb", {x: this.body.position.x, y: this.body.position.y, id: game.time.now});
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

        var AudioPlayer = __webpack_require__(2);

        var Bomb = function (x, y, id) {
            Phaser.Sprite.call(this, game, x, y, "bomb");
            this.id = id;

            this.anchor.setTo(.5, .5);
            game.physics.enable(this, Phaser.Physics.ARCADE);
            this.body.immovable = true;
            this.sizeTween = game.add.tween(this.scale).to({
                x: 1.2,
                y: 1.2
            }, 700, Phaser.Easing.Default, true, 0, true, true);
            this.animations.add('bomb', [0, 1, 2], 1.5, true);
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

        /***/
    },
    /* 13 */
    /***/ function (module, exports, __webpack_require__) {

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
            this.targetPosition = null
            this.lastMoveTime = null;

            if (!this.alive) {
                this.revive();
            }
        };

        module.exports = RemotePlayer;

        /***/
    },
    /* 14 */
    /***/ function (module, exports, __webpack_require__) {

        var TextConfigurer = __webpack_require__(3);

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
		var header = game.add.text(headerXOffset, headerYOffset, "Round " + roundNumber + " Complete!")
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
	};

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

        var PowerupIds = __webpack_require__(9);

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

        /***/
    },
    /* 17 */
    /***/ function (module, exports, __webpack_require__) {

        var TextConfigurer = __webpack_require__(3);

        function GameOver() {
        }

        GameOver.prototype = {
            init: function (winnerColor, winByDefault) {
                this.winnerColor = winnerColor;
                this.winByDefault = winByDefault;
            },

            create: function () {
                var textToDisplay = this.winByDefault ? "     No other players remaining.\n              You win by default." : "Game Over. Winner: " + this.winnerColor;
                textToDisplay += "\n\nPress Enter to return to main menu.";
                var textObject = game.add.text(game.camera.width / 2, game.camera.height / 2, textToDisplay);
                textObject.anchor.setTo(0.5, 0.5);
                TextConfigurer.configureText(textObject, "white", 28);
            },

            update: function () {
                if (game.input.keyboard.isDown(Phaser.Keyboard.ENTER)) {
                    this.returnToLobby();
                }
            },

            returnToLobby: function () {
                game.state.start("Lobby");
            }
        };

        module.exports = GameOver;

/***/ }
/******/ ]);