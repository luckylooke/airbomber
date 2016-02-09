var AudioPlayer = require("../util/audio_player");
var TextConfigurer = require('../util/text_configurer');

var textXOffset = 420;
var textYOffset = 200;

var Boot = function () {
};

module.exports = Boot;

Boot.prototype = {

    preload: function () {
    },

    create: function () {
        game.stage.disableVisibilityChange = true;
        game.input.maxPointers = 1;
        AudioPlayer.initialize();
        if (game.device.desktop) {
            game.stage.scale.pageAlignHorizontally = true;
            game.state.start('Preloader');
        } else {
            var text = game.add.text(textXOffset, textYOffset, 'Please run the game on your computer');
            TextConfigurer.configureText(text, "white", 45);
            text.anchor.setTo(.5, .5);
        }
    }
};
