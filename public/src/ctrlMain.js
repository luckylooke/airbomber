/* global AirConsole, RateLimiter, AirConsoleViewManager */

window.initController = init;
  
navigator.vibrate = (navigator.vibrate ||
                   navigator.webkitVibrate ||
                   navigator.mozVibrate ||
                   navigator.msVibrate);

var storage = localStorage || {};
var airconsole = new AirConsole({
                      orientation: AirConsole.ORIENTATION_LANDSCAPE,
                      device_motion: 100
                    });
// rateLimiter -> https://github.com/AirConsole/airconsole-controls/tree/master/rate-limiter                      
var rateLimiter = new RateLimiter(airconsole);
// viewMan -> https://github.com/AirConsole/airconsole-view-manager
var viewMan = new AirConsoleViewManager(airconsole);
var gyro = require('./ctrl/gyro.js')(storage);
var vmTools = require('./ctrl/vmTools')(viewMan, storage);
var acTools = require('./main/acTools')(airconsole);
var bomb = require('./ctrl/bomb')(airconsole, storage);

require('./ctrl/views/welcome')(vmTools, storage, gyro);
require('./ctrl/views/name_and_color')(vmTools, storage, acTools, airconsole);
require('./ctrl/views/gyro_calibration')(vmTools, gyro, storage);
require('./ctrl/views/dpad')(vmTools, storage, rateLimiter, bomb);
require('./ctrl/views/gyro_pad')(vmTools, gyro, storage, rateLimiter, bomb);

// FUNCTION DEFINITIONS: ***********************************************************************************************************************************************************************************

function init() {
    acTools.getCurrentView(AirConsole.SCREEN, function(data){
      storage.screenView = data.currentView;
      if(storage.currentView){
        vmTools.showWithCbs(storage.currentView);
      }
    });
    storage.autoCheckGyro = storage.autoCheckGyro === undefined ? true : storage.autoCheckGyro;
    storage.controller = storage.controller || 'DPad'; // DPad, Gyro
    
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
    // secondary listeners for some devices (e.g. Iphone)
    airconsole.onDeviceMotion =  getDoListener('onDeviceMotion');
    
    // listen to forced states from screen
    airconsole.onCustomDeviceStateChange = function(device_id, data) {
      viewMan.onViewChange(data, function(view_id) {
        console.log('view_id', view_id);
      });
    };
    
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
    
    // screen state notifications
    acTools.addListener('gameState', function(from, data){
      if(from == AirConsole.SCREEN && data.gameState){
        storage.screenView = data.gameState;
        storage.gameState = data.gameState;
        if(data.gameState === 'Level'){
          if(storage.controller === 'Gyro'){
            vmTools.showWithCbs("gyro-pad");
          }else{
            vmTools.showWithCbs("d-pad");
          }
        }
      }
    });
    
    /*
     * Makes the device vibrate if the screen says so.
     */
    acTools.addListener('vibrator', function(from, data) {
      if (from == AirConsole.SCREEN && data.vibrate) {
        navigator.vibrate(data.vibrate);
      }
    });
    
    // start contacting screen
    storage.acInterval = setInterval(function(){
      airconsole.message(AirConsole.SCREEN, {listener: 'ready'});
    }, 3000);
    
    // debug info
    acTools.addListener(undefined, function(from, data){
      console.log('on ctrl: ', from, data);
    });
}

function getDoListener(source){
    return function doListener(data) {
      if(data.beta || data.beta === 0){
        gyro.tilt({source: source, beta: data.beta, gamma: data.gamma});
      }
    };
}
