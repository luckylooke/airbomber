/* global Phaser, bomberman */
var MapInfo = require("./../common/map_info");
var game = bomberman.game,
	airconsole = bomberman.airconsole;

function GameOver() {
}

GameOver.prototype = {
	init: function(winner, winByDefault, tilemapName) {
		document.getElementById('game-over').style.backgroundImage = "url(" + MapInfo[tilemapName].background + ")";
		document.getElementById('game-over').addEventListener('click', this.returnToLobby);
		this.winner = winner;
		this.winByDefault = winByDefault;
		bomberman.level = undefined;
        bomberman.vmTools.showWithCbs('game-over');
	},

	create: function() {
		var textToDisplay = this.winByDefault ? "     No other players remaining.\n" + this.winner.nick + " win by default." : "Winner: " + this.winner.nick;
		textToDisplay += "\n\nPress Enter or Tap/Click anywhere to return to main menu.";
		document.getElementById('game-over-text').innerHTML = textToDisplay;
		document.getElementById('winner').children[0].setAttribute('src', './resource/icon_' + this.winner.color + '.png');
		airconsole.broadcast({listener: 'gameState', gameState: 'game-over'});
	},

	update: function() {
		if(game.input.keyboard.isDown(Phaser.Keyboard.ENTER)) {
			this.returnToLobby();
		}
	},

	returnToLobby: function() {
		game.state.start("Lobby");
	}
};

module.exports = GameOver;