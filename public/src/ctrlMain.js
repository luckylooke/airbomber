/* global AirConsole, DPad, Button, RateLimiter, AirConsoleViewManager */

window.initController = init;
  
navigator.vibrate = (navigator.vibrate ||
                   navigator.webkitVibrate ||
                   navigator.mozVibrate ||
                   navigator.msVibrate);

var storage = localStorage || {};
var gyro = require('./ctrl/gyro.js')(storage);
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

require('./ctrl/views/welcome')(vmTools, storage, gyro);
require('./ctrl/views/name_and_color')(vmTools, storage, acTools, AirConsole, airconsole);
require('./ctrl/views/gyro_calibration')(vmTools, gyro);
require('./ctrl/views/dpad')(vmTools, storage, AirConsole, rateLimiter, bomb);
require('./ctrl/views/gyro_pad')(vmTools, storage, AirConsole, rateLimiter, bomb);

// FUNCTION DEFINITIONS: ***********************************************************************************************************************************************************************************

function init() {
    storage.autoCheckGyro = storage.autoCheckGyro === undefined ? true : storage.autoCheckGyro;
    // standard listeners for some devices (e.g. Samsung Galaxy S4 mini)
    if (window.DeviceOrientationEvent) {
      window.addEventListener("deviceorientation", getDoListener('deviceorientation'), true);
    } else if (window.DeviceMotionEvent) {
      window.addEventListener('devicemotion', function (event) {
          gyro.tilt({source: 'devicemotion', beta: event.acceleration.x * 2, gamma: event.acceleration.y * 2});
      }, true);
    } else {
      window.addEventListener("MozOrientation", function (event) {
          event.gamma = -(event.x * (180 / Math.PI));
          event.beta = -(event.y * (180 / Math.PI));
          gyro.tilt({source: 'MozOrientation', beta: event.beta, gamma: event.gamma});
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
        gyro.tilt({source: source, beta: data.beta, gamma: data.gamma});
      }
    };
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
