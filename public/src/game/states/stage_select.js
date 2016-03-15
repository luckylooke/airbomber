/* global bomberman */
var MapInfo = require("./../common/map_info");
var game = bomberman.game;
var socket = bomberman.socket;
var StageSelect = function() {};

module.exports = StageSelect;

var stages = MapInfo;

StageSelect.prototype = {
    init: function () {
        bomberman.vmTools.showWithCbs('stage-select');
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
        
        for (var i in stages) {
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

	getHandler: function(index) {
		return function confirmStageSelection(){
	        socket.emit("select stage", {gameId: socket.id, tilemapName: stages[index].tilemapName});
      		bomberman.acTools.currentView = 'pending';
	        game.state.start("PendingGame", true, false, stages[index].tilemapName, socket.id);
		};
	}
	
};
