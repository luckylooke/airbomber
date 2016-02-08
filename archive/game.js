/* global Phaser */

var GameState = require("./states/game/GameState");

var game = new Phaser.Game(window.innerWidth, window.innerHeight, Phaser.CANVAS, 'game');

// game.state.add('Menu', MenuState, true);
// game.state.add('Lobby', LobbyState, true);
game.state.add('Game', GameState, true);