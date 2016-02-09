var PowerupIDs = require("../common/powerup_ids");

exports.generateItem = function() {
    var randomNumber = Math.floor(Math.random() * 10) + 1;
    //console.log("randomNumber be ", randomNumber);
	if (randomNumber < 2) {
		return PowerupIDs.BOMB_STRENGTH;
	} else if (randomNumber < 3) {
		return PowerupIDs.BOMB_CAPACITY;
	} else if(randomNumber < 4){
		return PowerupIDs.SPEED;
	} else {
		return 0;
	}
};