/* global Phaser, bomberman, io */
if(!bomberman) {
    bomberman = {};
}
var game = bomberman.game = new Phaser.Game(875, 525, Phaser.AUTO, 'bomber');
bomberman.screen = {};
bomberman.socket = io();
bomberman.level = null;

game.state.add("Boot", require("./game/states/boot"));
game.state.add("Preloader", require("./game/states/preloader"));
game.state.add("Lobby", require("./game/states/lobby"));
game.state.add("StageSelect", require("./game/states/stage_select"));
game.state.add("PendingGame", require("./game/states/pending_game"));
game.state.add("Level", require("./game/states/level"));
game.state.add("GameOver", require("./game/states/game_over"));

game.state.start('Boot');