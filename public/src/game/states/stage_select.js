var StageSelect = function() {};

module.exports = StageSelect;

var xOffset = 180;
var yOffset = 25;
var thumbnailXOffset = 396;
var thumbnailYOffset = 125;
var stageNameYOffset = 320;

var stages = {name: "Comeback", thumbnailKey: "first_", tilemapName: "First", maxPlayers: 4, size: "medium"};

StageSelect.prototype = {
    init: function (gameId) {
		this.gameId = gameId;
	},

	create: function() {
        game.add.sprite(0, 0, 'background_s');
		var selectionWindow = game.add.image(xOffset, yOffset, "select_stage");
        this.okButton = game.add.button(625, 425, "ok_button", this.confirmStageSelection, this, 1, 0);
        this.thumbnail = game.add.image(thumbnailXOffset, thumbnailYOffset, stages.thumbnailKey);
        this.text = game.add.text(game.camera.width / 2, stageNameYOffset, stages.name);
		this.configureText(this.text, "white", 28);
		this.text.anchor.setTo(.5, .5);
        this.numPlayersText = game.add.text(360, 380, "Max # of players:   " + stages.maxPlayers);
		this.configureText(this.numPlayersText, "white", 18);
        this.stageSizeText = game.add.text(360, 410, "Map size:   " + stages.size);
		this.configureText(this.stageSizeText, "white", 18);
	},

	update: function() {
	},

	configureText: function(text, color, size) {
		text.font = "Carter One";
		text.fill = color;
		text.fontSize = size;
	},

	confirmStageSelection: function() {
        socket.emit("select stage", {mapName: stages.tilemapName});
        game.state.start("PendingGame", true, false, stages.tilemapName, this.gameId);
	}
};