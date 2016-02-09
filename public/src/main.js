// TODO: Remove Window polution (move it to bomberman global)
window.game = new Phaser.Game(875, 525, Phaser.AUTO, 'bomber');
window.player = null;
window.socket = null;
window.level = null;

    socket = io();

	game.state.add("Boot", require("./game/states/boot"));
	game.state.add("Preloader", require("./game/states/preloader"));
	game.state.add("Lobby", require("./game/states/lobby"));
	game.state.add("StageSelect", require("./game/states/stage_select"));
	game.state.add("PendingGame", require("./game/states/pending_game"));
	game.state.add("Level", require("./game/states/level"));
	game.state.add("GameOver", require("./game/states/game_over"));

	game.state.start('Boot');