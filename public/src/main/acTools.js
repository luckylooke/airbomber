/* global AirConsole */
module.exports = function(airconsole, viewMan, devType){
    var acTools = {};
    
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
    acTools.getCurrentView = function(device, cb){
      if(device === airconsole.getDeviceId()){
        return viewMan.current_view.self;
      }
      airconsole.message(device, {listener: 'currentView'});
      if(cb)
       acTools.addListener('currentViewAnswer', cbOnce(cb));
    };
    acTools.addListener('currentView', function(device_id){
      var view = acTools.getCurrentView(airconsole.getDeviceId());
      airconsole.message(device_id, {listener: 'currentViewAnswer', currentView: view});
    });
    
    if(devType === 'screen'){
      airconsole.onConnect = function(device_id) {
      	// deviceConnectionChange();
      	airconsole.setActivePlayers(20);
      	console.log('connected: ', arguments);
      };
    }
    
    airconsole.onMessage = acTools.onMessage;
    return acTools;
    
    function cbOnce(cb){
      return function(){
        cb.apply(this, arguments);
        acTools.rmListener('screenCurrentView');
      };
    }
};