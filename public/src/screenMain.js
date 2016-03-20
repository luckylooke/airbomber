/* global Phaser, AirConsole, io, AirConsoleViewManager */

// localStorage.debug = '*'; // DEBUGGING socket.io
localStorage.clear(); // deactivate localStorage for testing

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
bomberman.socket = require('./main/socketSetup')(io, game);
bomberman.viewMan = new AirConsoleViewManager(airconsole);
bomberman.acTools = require('./main/acTools')(airconsole, bomberman.viewMan, bomberman.device);
bomberman.vmTools = require('./main/vmTools')(bomberman.viewMan, bomberman.storage, bomberman.device);


// debug info
bomberman.acTools.addListener(undefined, function(from, data){
	if(!data.listener || data.listener !== 'movePlayer'){
		console.log('on screen: ', from, data);
	}
});

game.state.add("Boot", require("./game/states/boot"));
game.state.add("Preloader", require("./game/states/preloader"));
game.state.add("Lobby", require("./game/states/lobby"));
game.state.add("StageSelect", require("./game/states/stage_select"));
game.state.add("PendingGame", require("./game/states/pending_game"));
game.state.add("Level", require("./game/states/level"));
game.state.add("GameOver", require("./game/states/game_over"));

require.context("./game/", true, /\.js$/);
