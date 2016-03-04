/* global Phaser, bomberman, io */
if(!bomberman) {
    bomberman = {};
}

bomberman.width = bomberman.bomberElm.clientWidth;
bomberman.height = bomberman.bomberElm.clientHeight;

var game = bomberman.game = new Phaser.Game(bomberman.width, bomberman.height, Phaser.AUTO, 'bomber');
bomberman.screen = {};
// bomberman.socket = io(); // cloud9
bomberman.socket = io('http://airbomber-luckylooke.rhcloud.com:8000'); // openshift
bomberman.level = null;

game.state.add("Boot", require("./game/states/boot"));
game.state.add("Preloader", require("./game/states/preloader"));
game.state.add("Lobby", require("./game/states/lobby"));
game.state.add("StageSelect", require("./game/states/stage_select"));
game.state.add("PendingGame", require("./game/states/pending_game"));
game.state.add("Level", require("./game/states/level"));
game.state.add("GameOver", require("./game/states/game_over"));

game.state.start('Boot');

require.context("./game/", true, /\.js$/);undefined
