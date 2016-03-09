/* global Button, AirConsole  */
module.exports = function (vmTools, gyro, storage, rateLimiter, bomb) {
  var pointerStyle = document.getElementById('gyro-indicator-pointer').style,
    triangleUpStyle = document.getElementById('triangle-up').style,
    triangleDownStyle = document.getElementById('triangle-down').style,
    triangleLeftStyle = document.getElementById('triangle-left').style,
    triangleRightStyle = document.getElementById('triangle-right').style;

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
    pointerStyle.top = 50 + data.y*50 - 4 + '%'; // 4 is pointer radius 
    pointerStyle.left = 50 + data.x*50 - 4 + '%';
    
    if(data.y === 1){ // triangle-up is showed on MAXimum down and so on!
      triangleUpStyle.display = 'block';
    }else{
      triangleUpStyle.display = 'none';
    } 
    if(data.y === -1){
      triangleDownStyle.display = 'block';
    }else{
      triangleDownStyle.display = 'none';
    } 
    if(data.x === 1){
      triangleLeftStyle.display = 'block';
    }else{
      triangleLeftStyle.display = 'none';
    } 
    if(data.x === -1){
      triangleRightStyle.display = 'block';
    }else{
      triangleRightStyle.display = 'none';
    }
    
    data.nick = storage.nickname;
    data.type = 'Gyro';
    data.listener = 'movePlayer';
    rateLimiter.message(AirConsole.SCREEN, data);
    console.log(data);
  }
  
  vmTools.cbs['gyro-pad'] = {
    to: function(){
      if(storage.screenView !== 'Level'){
        vmTools.showWithCbs('welcome');
      }
    }
  };
};