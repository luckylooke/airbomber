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
		var pendingGameElement = document.getElementById('pending-game');
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
        bomberman.selectedStage = completeStages[0];
        completeStages[0].classList.remove("hidden");
		
		arrow_left.addEventListener('click',function(f){
			changeMap('left');
		})
		
		arrow_right.addEventListener('click',function(f){
			changeMap('right');
		})
		
		function changeMap(direction){
		completeStages[currentStage].classList.add("hidden");
			
			if(direction == 'right'){
				currentStage++;
				if(currentStage >= completeStages.length)
				currentStage = 0;
			}
			else if (direction == 'left'){
				currentStage--;
				if(currentStage < 0)
				currentStage = completeStages.length - 1;
			}
			
			bomberman.selectedStage = completeStages[currentStage];
			
			stageSelectElement.style.backgroundImage = "url(" + completeStages[currentStage].background + ")";	
			completeStages[currentStage].classList.remove("hidden");
		}
	},

	update: function() {
	},

	getHandler: function(index) {
		return function confirmStageSelection(){
	        socket.emit("select stage", {gameId: bomberman.storage.gameId, tilemapName: stages[index].tilemapName});
	        game.state.start("PendingGame", true, false, stages[index].tilemapName, bomberman.storage.gameId);
		};
	}
	
	
	
};
