var bombSound;
var powerupSound;
var musicSound;

module.exports = {
	initialize: function() {
		bombSound = game.add.audio("explosion");
		powerupSound = game.add.audio("powerup");
        musicSound = game.add.audio("music", 0.5);
	},

	playBombSound: function() {
		bombSound.play();
	},

	playPowerupSound: function() {
		powerupSound.play();
    },

    playMusicSound: function () {
        musicSound.play();
    },
    stopMusicSound: function () {
        musicSound.stop();
    }
};