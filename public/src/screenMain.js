/* global Phaser, AirConsole, io */

var bomberman = window.bomberman = {}; // namespace in global
bomberman.bomberElm = document.getElementById('bomber');
bomberman.guiElm = document.getElementById('gui');

bomberman.width = bomberman.bomberElm.clientWidth;
bomberman.height = bomberman.bomberElm.clientHeight;

var game = bomberman.game = new Phaser.Game(bomberman.width, bomberman.height, Phaser.AUTO, 'bomber');
bomberman.screen = {};
bomberman.level = null;
bomberman.airconsole = new AirConsole();
bomberman.socket = require('./main/socketSetup')(io, game);
bomberman.acTools = require('./main/airconsoleSetup')(bomberman.airconsole, 'screen');

game.state.add("Boot", require("./game/states/boot"));
game.state.add("Preloader", require("./game/states/preloader"));
game.state.add("Lobby", require("./game/states/lobby"));
game.state.add("StageSelect", require("./game/states/stage_select"));
game.state.add("PendingGame", require("./game/states/pending_game"));
game.state.add("Level", require("./game/states/level"));
game.state.add("GameOver", require("./game/states/game_over"));

require.context("./game/", true, /\.js$/);
