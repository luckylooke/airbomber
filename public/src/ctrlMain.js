/* global AirConsole, DPad, Button, RateLimiter, AirConsoleViewManager */

window.initController = init;
  
navigator.vibrate = (navigator.vibrate ||
                   navigator.webkitVibrate ||
                   navigator.mozVibrate ||
                   navigator.msVibrate);

var gyro = require('./ctrl/gyro.js');
var airconsole = new AirConsole({
                      orientation: AirConsole.ORIENTATION_LANDSCAPE,
                      device_motion: 100
                    });
// rateLimiter -> https://github.com/AirConsole/airconsole-controls/tree/master/rate-limiter                      
var rateLimiter = new RateLimiter(airconsole);
// viewMan -> https://github.com/AirConsole/airconsole-view-manager
var viewMan = new AirConsoleViewManager(airconsole);
var vmTools = require('./ctrl/vmTools')(viewMan);
var acTools = require('./main/acTools')(airconsole);
var storage = localStorage || {};

require('./ctrl/views/welcome')(vmTools, storage, gyro);
require('./ctrl/views/name_and_color')(vmTools, storage, acTools, AirConsole, airconsole);
require('./ctrl/views/gyro_calibration')(vmTools, gyro);

var dpad = {};
var STILL_SNAP = 10; // [%] of movement to be considered as still player
var TILT_LIMITER_RATE = 200; // [ms] of minimal time between tilt function executions

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

new Button("button-bomb-gyro", {
  "down": function() {
    bomb('setting');
  },
  "up": function() {
    bomb(!'setting');
  }
});



// FUNCTION DEFINITIONS: ***********************************************************************************************************************************************************************************

function init() {
    storage.autoCheckGyro = storage.autoCheckGyro === undefined ? true : storage.autoCheckGyro;
    // standard listeners for some devices (e.g. Samsung Galaxy S4 mini)
    if (window.DeviceOrientationEvent) {
      window.addEventListener("deviceorientation", getDoListener('deviceorientation'), true);
    } else if (window.DeviceMotionEvent) {
      window.addEventListener('devicemotion', function (event) {
          tilt({source: 'devicemotion', beta: event.acceleration.x * 2, gamma: event.acceleration.y * 2});
      }, true);
    } else {
      window.addEventListener("MozOrientation", function (event) {
          event.gamma = -(event.x * (180 / Math.PI));
          event.beta = -(event.y * (180 / Math.PI));
          tilt({source: 'MozOrientation', beta: event.beta, gamma: event.gamma});
      }, true);
    }
    
    storage.controller = storage.controller || 'DPad'; // DPad, Gyro
    
    // secondary listeners for some devices (e.g. Iphone)
    airconsole.onDeviceMotion =  getDoListener('onDeviceMotion');
    
    airconsole.onMessage = acTools.onMessage;
    
      airconsole.onCustomDeviceStateChange = function(device_id, data) {
        viewMan.onViewChange(data, function(view_id) {
          console.log('view_id', view_id);
        });
      };
    
    storage.acInterval = setInterval(function(){
      airconsole.message(AirConsole.SCREEN, {listener: 'ready'});
    }, 3000);
    
    // debug info
    acTools.addListener(undefined, function(from, data){
      console.log('on ctrl: ', from, data);
    });
        
    acTools.addListener('gameState', function(from, data){
      if(from == AirConsole.SCREEN && data.gameState){
        storage.gameState = data.gameState;
      }
    });
    
    /*
     * Checks if this device is part of the active game.
     */
    airconsole.onActivePlayersChange = function(player) {
      // var div = document.getElementById("player_id");
      // if (player !== undefined) {
      //   div.innerHTML =  (["Left Player", "Right Player"][player]);
      // } else {
      //   div.innerHTML = "It's a 2 player game!";
      // }
    };
    
    
    /*
     * Makes the device vibrate if the screen says so.
     */
    acTools.addListener('vibrator', function(from, data) {
      if (from == AirConsole.SCREEN && data.vibrate) {
        navigator.vibrate(data.vibrate);
      }
    });
    
    
    
   
}

function getDoListener(source){
    return function doListener(data) {
      if(data.beta || data.beta === 0){
        tilt({source: source, beta: data.beta, gamma: data.gamma});
      }
    };
}

function tilt(data){
    if(tiltLimiter()){
      return;
    }
    if(gyro.calibrated){
       if(storage.gameState === 'level'){
          var mov = process('beta', {x: 0, y:0});
          mov = process('gamma', mov);
          // console.log(mov.x + " - " + mov.y, mov);
          moveGyro(mov);
        }
    }else{
      if(storage.controller !== 'Gyro' && (data.gamma || data.beta)){
        storage.controller = storage.autoCheckGyro ? 'Gyro' : storage.controller;
      }
      gyro.actual = data;
    }
    
    function process(name, mov){
      var value = data[name],
        axis, dir;
      
      if(value > gyro.CENTER[name]){
        dir = gyro['MAX_' + name.toUpperCase() + '_SIDE'];
        axis = gyro.dirToAxis[dir];
        mov[axis] = Math.abs(value - gyro.CENTER[name]) / Math.abs(gyro['MAX_' + name.toUpperCase()]);
      }else{
        dir = gyro['MIN_' + name.toUpperCase() + '_SIDE'];
        axis = gyro.dirToAxis[dir];
        mov[axis] = Math.abs(value - gyro.CENTER[name]) / Math.abs(gyro['MIN_' + name.toUpperCase()]);
      }
      
      mov[axis] *= gyro.dirToSign[dir];
      mov[axis] *= gyro.flipCor;
      return mov;
    }
}

function tiltLimiter(){
    if(this.tiltLimit){
      return true;
    }else{
      this.tiltLimit = true;
      setTimeout(function(){
        this.tiltLimit = false;
      }, TILT_LIMITER_RATE);
      return false;
    }
}

/**
 * Tells the screen to move the paddle of this player.
 * @param amount
 */
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
function moveGyro(data) {
  data.nick = storage.nickname;
  data.type = 'Gyro';
  data.listener = 'movePlayer';
  rateLimiter.message(AirConsole.SCREEN, data);
  console.log(data);
}
function bomb(setting) {
  airconsole.message(AirConsole.SCREEN, {
    listener: 'setBomb',
    nick: storage.nickname,
    setting: setting
  });
  console.log({
    listener: 'setBomb',
    nick: storage.nickname,
    setting: setting
  });
}

// require('./main/socketSetup');
