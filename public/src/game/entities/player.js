/* global Phaser, bomberman */

var Bomb = require("./bomb");
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
    
        if (ctrl.x || ctrl.y) {
            this.animations.play(this.facing);
            socket.emit("move player", {x: this.position.x, y: this.position.y, facing: this.facing, nick: this.nick});
        }else{
            this.freeze();
        }
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