/* global AirConsole */
module.exports = function(bomberman){
    var airconsole = bomberman.airconsole = new AirConsole();
    var acTools = bomberman.acTools = {};
    
    acTools.listeners = {};
    acTools.uniListeners = [];
    acTools.addListener = function(name, fn){
    	if(!fn){
    		return;
    	}else if(typeof name !== 'string'){
    		if(typeof name === 'undefined'){
    			acTools.uniListeners.push(fn);
    		}
    		return;
    	}
    	acTools.listeners[name] = fn;	
    };
    acTools.rmListener = function(name, fn){
    	if(fn && typeof name === 'undefined'){
    		var index = acTools.uniListeners.indexOf(fn);
    		acTools.uniListeners.splice(index, 1);
    	}else{
    		delete acTools.listeners[name];
    	}
    };
    acTools.onMessage = function(device_id, data) {
    	if(data.listener && acTools.listeners[data.listener]){
    		acTools.listeners[data.listener](device_id, data);
    	}
    	for (var i = 0; i < acTools.uniListeners.length; i++) {
    		acTools.uniListeners[i](device_id, data);
    	}
    };
    
    airconsole.onConnect = function(device_id) {
      	// deviceConnectionChange();
      	airconsole.setActivePlayers(20);
    	console.log('connected: ', arguments);
    };
    
    airconsole.onDisconnect = function(device_id) {
      //var player = airconsole.convertDeviceIdToPlayerNumber(device_id);
      //if (player != undefined) {
      //  // Player that was in game left the game.
      //  // Setting active players to length 0.
      //  // airconsole.setActivePlayers(0);
      //}
      //deviceConnectionChange();
    };
    
    // function deviceConnectionChange() {
    //     var active_players = airconsole.getActivePlayerDeviceIds();
    //     var connected_controllers = airconsole.getControllerDeviceIds();
    //     // Only update if the game didn't have active players.
    //     if (active_players.length == 0) {
    //       if (connected_controllers.length >= 2) {
    //         // Enough controller devices connected to start the game.
    //         // Setting the first 2 controllers to active players.
    //         airconsole.setActivePlayers(20);
    //     //     resetBall(50, 0);
    //     //     score = [0, 0];
    //     //     score_el.innerHTML = score.join(":");
    //     //     document.getElementById("wait").innerHTML = "";
    //     //   } else if (connected_controllers.length == 1) {
    //     //     document.getElementById("wait").innerHTML = "Need 1 more player!";
    //     //     resetBall(0, 0);
    //     //   } else if (connected_controllers.length == 0) {
    //     //     document.getElementById("wait").innerHTML = "Need 2 more players!";
    //     //     resetBall(0, 0);
    //       }
    //     }
    //   }

    airconsole.onMessage = acTools.onMessage;
}