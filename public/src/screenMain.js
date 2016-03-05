/* global Phaser */

var bomberman = window.bomberman = {}; // namespace in global
bomberman.device = 'screen';
bomberman.bomberElm = document.getElementById('bomber');
bomberman.guiElm = document.getElementById('gui');

bomberman.width = bomberman.bomberElm.clientWidth;
bomberman.height = bomberman.bomberElm.clientHeight;

var game = bomberman.game = new Phaser.Game(bomberman.width, bomberman.height, Phaser.AUTO, 'bomber');
bomberman.screen = {};
bomberman.level = null;

require('./main/socketSetup')(bomberman); // dependency global io
require('./main/airconsoleSetup')(bomberman); // dependency global AirConsole

game.state.add("Boot", require("./game/states/boot"));
game.state.add("Preloader", require("./game/states/preloader"));
game.state.add("Lobby", require("./game/states/lobby"));
game.state.add("StageSelect", require("./game/states/stage_select"));
game.state.add("PendingGame", require("./game/states/pending_game"));
game.state.add("Level", require("./game/states/level"));
game.state.add("GameOver", require("./game/states/game_over"));

require.context("./game/", true, /\.js$/);
