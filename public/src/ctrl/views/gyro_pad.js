/* global Button, AirConsole  */
module.exports = function (vmTools, gyro, storage, rateLimiter, bomb) {
  var pointerStyle = document.getElementById('gyro-indicator-pointer').style;

  gyro.output = moveGyro;
  
  new Button("button-bomb-gyro", {
    "down": function() {
      bomb('setting');
    },
    "up": function() {
      bomb(!'setting');
    }
  });
  
  function moveGyro(data) {
    pointerStyle.top = 50 - data.y*50 - 4 + '%'; // 4 is pointer radius 
    pointerStyle.left = 50 + data.x*50 - 4 + '%';
    
    data.nick = storage.nickname;
    data.type = 'Gyro';
    data.listener = 'movePlayer';
    rateLimiter.message(AirConsole.SCREEN, data);
    console.log(data);
  }
  
  vmTools.cbs['gyro-pad'] = {
    to: function(){
      if(storage.screenView !== 'level'){
        vmTools.showWithCbs('welcome');
      }
    }
  };
};