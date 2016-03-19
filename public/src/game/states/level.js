/* global Phaser, bomberman */
var BLACK_HEX_CODE = "#000000";
var TILE_SIZE = 35;

var PowerupIDs = require("./../common/powerup_ids");
var MapInfo = require("./../common/map_info");
var AudioPlayer = require("./../util/audio_player");
var Player = require("./../entities/player");
var RemotePlayer = require("./../entities/remoteplayer");
var Bomb = require("./../entities/bomb");
var RoundEndAnimation = require("./../entities/round_end_animation");
var PowerupImageKeys = require("./../util/powerup_image_keys");
var PowerupNotificationPlayer = require("./../util/powerup_notification_player");
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
