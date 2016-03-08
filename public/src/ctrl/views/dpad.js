/* global DPad, Button, AirConsole */
module.exports = function (vmTools, storage, rateLimiter, bomb) {
  var dpad = {};
  new DPad("my-DPad", {
    // Set to true if you want to have a relative swipe dpad
    "relative": false,
    // Gets called when the dpad direction changes.
    // Key is one of: DPad.UP, DPad.DOWN, DPad.LEFT, DPad.RIGHT.
    // Pressed is a boolean, true if the direction is active.
    "directionchange": function(key, pressed) {
      if(storage.controller === 'DPad'){
        switch(key) {
          case 'right':
              dpad.x = pressed ? 1 : 0;
              break;
          case 'left':
              dpad.x = pressed ? -1 : 0;
              break;
          case 'up':
              dpad.y = pressed ? -1 : 0;
              break;
          case 'down':
              dpad.y = pressed ? 1 : 0;
              break;
        }
        moveDPad();
      }
    },
  
    // // Gets called when the DPad is touched.
    // "touchstart": function() {
    //   console.log('touch start');
    // },
    
    // // Gets called when the DPad is released.
    // // had_direction is a boolean that tells you if at lease one direction was active.
    // //               can be used to determine if it was just a "tap" on the DPad.
    // "touchend": function(had_direction) {
    //   console.log('touch end', had_direction);
    // },
  
    // (Optional) distance which the user needs to move before triggering a direction.
    "distance": {x: 10, y:10},
    
    // (Optional) diagonal: If true, diagonal movement are possible and it becomes a 8-way DPad:
    //                      For exmaple UP and RIGHT at the same time.
    "diagonal": true
  });
  
  new Button("button-bomb", {
    "down": function() {
      bomb('setting');
    },
    "up": function() {
      bomb(!'setting');
    }
  });
  
  function moveDPad() {
    rateLimiter.message(AirConsole.SCREEN, {
      type: 'DPad',
      listener: 'movePlayer',
      nick: storage.nickname,
      x: dpad.x,
      y: dpad.y
    });
    console.log({
      type: 'DPad',
      listener: 'movePlayer',
      nick: storage.nickname,
      x: dpad.x,
      y: dpad.y
    });
  }
  
  vmTools.cbs['gamepad-container'] = {
    to: function(){
      if(storage.screenView !== 'level'){
        vmTools.showWithCbs('welcome');
      }
    }
  };
};