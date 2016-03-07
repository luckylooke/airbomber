/* global Button*/
module.exports = function (gyro, storage, AirConsole, rateLimiter, bomb) {
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
};