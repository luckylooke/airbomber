/* global Button, AirConsole  */
module.exports = function (vmTools, gyro, storage, rateLimiter, bomb) {
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