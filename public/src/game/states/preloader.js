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
        this.load.tilemap("DesertCanyon", "assets/levels/DesertCanyon.json", null, Phaser.Tilemap.TILED_JSON);
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
