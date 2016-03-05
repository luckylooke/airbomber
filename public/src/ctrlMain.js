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
var acTools = require('./main/airconsoleSetup')(airconsole);

var storage = localStorage || {};
var colors = ['black','white','blue','green','red','lightblue','yellow','purple'];
var gameState;
var autoCheckGyro = true;
var orientationDefault;
var orientationOpposite = {
"-90": 90,
"90": -90,
"landscape-secondary": 'landscape-primary',
"landscape-primary": 'landscape-secondary'
};
var acInterval;
var controller = 'DPad'; // DPad, Gyro
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
  if(controller === 'DPad'){
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
  }
  moveDPad();
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
    
    document.getElementById('player_name').value = storage.nickname || '';
    var colorsElm = document.getElementById('colors');
    var colorElm = colorsElm.children[0];
    var newColorElm;
    colorsElm.innerHTML = '';
    console.log('storage.color', storage.color);
    for (var i = 0; i < colors.length; i++) {
    	var color = colors[i];
    	newColorElm = colorElm.cloneNode(true);
    	newColorElm.setAttribute('src', 'resource/icon_' + color + '.png');
    	if(storage.color === color){
    	  newColorElm.classList.add('selected');
    	}
    	colorsElm.appendChild(newColorElm);
    }
    
    // secondary listeners for some devices (e.g. Iphone)
    airconsole.onDeviceMotion =  getDoListener('onDeviceMotion');
    
    window.addEventListener("orientationchange", function() {
      if(!orientationDefault){
        return;
      }
      
      var currentOrientation = getOrientation();
      if(currentOrientation === orientationOpposite[orientationDefault]){
        document.body.classList.add('upside-down');
        gyro.flipCor = -1;
        
      }else{
        document.body.classList.remove('upside-down');
        gyro.flipCor = 1;
      }
    });
    
    document.getElementById('addPlayer').addEventListener('click', addPlayer);
    document.getElementById('calibrateBtn').addEventListener('click', calibrate);
    document.getElementById('calStartOverBtn').addEventListener('click', gyro.startOver);
    
    airconsole.onMessage = acTools.onMessage;
    
    acInterval = setInterval(function(){
      airconsole.message(AirConsole.SCREEN, {listener: 'ready'});
    }, 3000);
    
    // debug info
    acTools.addListener(undefined, function(from, data){
      console.log('on ctrl: ', from, data);
    });
        
    acTools.addListener('gameState', function(from, data){
      if(from == AirConsole.SCREEN && data.gameState){
        gameState = data.gameState;
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
    
    document.addEventListener('click',function(e){
      	var clickedElement = e.target;
      	if (clickedElement.classList.contains('player-color')){
      	  unselectAll(clickedElement);
      	  clickedElement.classList.add('selected');
      	}
    });
    
    // timeout to get chance gyro/accelerators to fire tilt() function and so tell controller to use gyro functiuonality
    setTimeout(afterInit, 500);
}

function calibrate(){
    if(!orientationDefault){
      orientationDefault = getOrientation();
    }
    gyro.calibrate(function(){
      viewMan.show("name-and-color");
    });
}

function getOrientation(){
    return screen.orientation || screen.mozOrientation || screen.msOrientation || window.orientation;
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
      // if(gameState === 'level'){
      var mov = process('beta', {x: 0, y:0});
      mov = process('gamma', mov);
      // console.log(mov.x + " - " + mov.y, mov);
      moveGyro(mov);
    // }
    }else{
      controller = autoCheckGyro ? 'Gyro' : controller;
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

function afterInit(){
 if(controller === 'DPad'){
    viewMan.show("name-and-color");
  }else{
    viewMan.show("gyro-calibration");
  }
  autoCheckGyro = false;
}

function addPlayer(){
    getPlayerInfo();
    if(storage.color && storage.nickname){
      if(controller === 'Gyro'){
        viewMan.show("gyro-pad");
      }else{
        viewMan.show("gamepad-container");
      }
    }
    acTools.addListener('ready', function(from, data){
      if(storage.color && storage.nickname && from == AirConsole.SCREEN && gameState === 'pending_game'){
        clearInterval(acInterval);
        airconsole.message(AirConsole.SCREEN, {
          listener: 'newPlayer',
          nick: storage.nickname,
          color: storage.color,
          controller: controller
        });
      }
      if(data.gameState){
        gameState = data.gameState;
      }
    });
}

function getPlayerInfo(){
    storage.color = getColor();
    storage.nickname = getName();
}

function getColor(){
    var el = document.getElementsByClassName('selected');
    if (el[0]){
       var reg = /[a-z]+(?=.png)(?!_)/,
          color;
       if(el[0].currentSrc)
         color = reg.exec(el[0].currentSrc);
       else if (el[0].src)
         color = reg.exec(el[0].src);
    }
    return color ? color[0] : '';
}

function getName(){
    return document.getElementById('player_name').value;
}
  
function unselectAll(clickedElement){
    var allCharacters = document.getElementsByClassName(clickedElement.className);
    for(var i = 0; i < allCharacters.length; i++)
      allCharacters[i].classList.remove('selected');
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
