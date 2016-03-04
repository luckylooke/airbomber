/* global bomberman */
var game = bomberman.game;
var socket = bomberman.socket;
var StageSelect = function() {};

module.exports = StageSelect;

// var xOffset = 180;
// var yOffset = 25;
// var thumbnailXOffset = 396;
// var thumbnailYOffset = 125;
// var stageNameYOffset = 320;

var stages = [
	{name: "Green field", thumbnailFile: "../resource/green_field_thumbnail.png", tilemapName: "First", maxPlayers: 4, size: "Small", background:"../resource/green_field_background.png"},
	{name: "Green hell", thumbnailFile: "../resource/green_hell_thumbnail.png", tilemapName: "Second", maxPlayers: 4, size: "Small", background:"../resource/green_hell_background.png"},
	{name: "Desert2", thumbnailFile: "../resource/danger_desert_thumbnail.png", tilemapName: "Third", maxPlayers: 4, size: "Small", background:"../resource/danger_desert_background.png"},
];

StageSelect.prototype = {
    init: function () {
    	document.getElementById('stage-select').classList.remove("hidden");
    	
	},

	create: function() {
		var htmlStagesElm = document.getElementById('stages');
		var htmlStageElm = htmlStagesElm.children[0].cloneNode(true);
		var completeStages = [];
		var arrow_left = document.getElementById('arrow-left');
		var arrow_right = document.getElementById('arrow-right');
		var stageSelectElement = document.getElementById('stage-select');
		var pendingGameElement = document.getElementById('pendingGame');
		var currentStage = 0;
		htmlStagesElm.innerHTML = '';
		
		var stage,
			newStageElm;
        
        for (var i = 0; i < stages.length; i++) {
        	stage = stages[i];
        	newStageElm = htmlStageElm.cloneNode(true);
        	newStageElm.children[0].innerHTML = stage.name;
        	newStageElm.children[1].setAttribute('src', stage.thumbnailFile);
        	newStageElm.children[2].innerHTML = 'Max players: ' + stage.maxPlayers;
        	newStageElm.children[3].innerHTML = 'Size: ' + stage.size;
        	newStageElm.addEventListener("click", this.getHandler(i));
        	newStageElm.classList.add("hidden");
        	newStageElm.background = stage.background;
        	htmlStagesElm.appendChild(newStageElm);
        	completeStages.push(newStageElm);
        }
        
        stageSelectElement.style.backgroundImage = "url(" + completeStages[0].background + ")";
        pendingGameElement.style.backgroundImage = "url(" + completeStages[0].background + ")";	
        completeStages[0].classList.remove("hidden");
        // game.add.sprite(0, 0, 'background_s');
		// var selectionWindow = game.add.image(xOffset, yOffset, "select_stage");
        // this.okButton = game.add.button(625, 425, "ok_button", this.confirmStageSelection, this, 1, 0);
        // this.thumbnail = game.add.image(thumbnailXOffset, thumbnailYOffset, stage.thumbnailKey);
        // this.text = game.add.text(game.camera.width / 2, stageNameYOffset, stage.name);
		// this.configureText(this.text, "white", 28);
		// this.text.anchor.setTo(.5, .5);
  //      this.numPlayersText = game.add.text(360, 380, "Max # of players:   " + stage.maxPlayers);
		// this.configureText(this.numPlayersText, "white", 18);
  //      this.stageSizeText = game.add.text(360, 410, "Map size:   " + stage.size);
		// this.configureText(this.stageSizeText, "white", 18);
		
		
		
		arrow_left.addEventListener('click',function(f){
		completeStages[currentStage].classList.add("hidden");
			currentStage--;
			if(currentStage < 0)
				currentStage = completeStages.length - 1;
				
			stageSelectElement.style.backgroundImage = "url(" + completeStages[currentStage].background + ")";	
			pendingGameElement.style.backgroundImage = "url(" + completeStages[currentStage].background + ")";	
		
		completeStages[currentStage].classList.remove("hidden");		
		})
		
		arrow_right.addEventListener('click',function(f){
			completeStages[currentStage].classList.add("hidden");
			
			currentStage++;
			if(currentStage >= completeStages.length)
				currentStage = 0;
				
			stageSelectElement.style.backgroundImage = "url(" + completeStages[currentStage].background + ")";	
			pendingGameElement.style.backgroundImage = "url(" + completeStages[currentStage].background + ")";	
				
			completeStages[currentStage].classList.remove("hidden");	
		})
	},

	update: function() {
	},

	// configureText: function(text, color, size) {
	// 	text.font = "Carter One";
	// 	text.fill = color;
	// 	text.fontSize = size;
	// },

	getHandler: function(index) {
		return function confirmStageSelection(){
			document.getElementById('stage-select').classList.add("hidden");
	        socket.emit("select stage", {slotId: socket.id, mapName: stages[index].tilemapName});
	        game.state.start("PendingGame", true, false, stages[index].tilemapName, socket.id);
		};
	}
	
};
