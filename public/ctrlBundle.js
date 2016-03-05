/******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};

/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {

/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId])
/******/ 			return installedModules[moduleId].exports;

/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			exports: {},
/******/ 			id: moduleId,
/******/ 			loaded: false
/******/ 		};

/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);

/******/ 		// Flag the module as loaded
/******/ 		module.loaded = true;

/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}


/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;

/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;

/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";

/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(0);
/******/ })
/************************************************************************/
/******/ ({

/***/ 0:
/***/ function(module, exports, __webpack_require__) {

	/* WEBPACK VAR INJECTION */(function(process) {/* global AirConsole, DPad, Button, RateLimiter, AirConsoleViewManager */

	window.initController = init;
	  
	navigator.vibrate = (navigator.vibrate ||
	                   navigator.webkitVibrate ||
	                   navigator.mozVibrate ||
	                   navigator.msVibrate);

	var gyro = __webpack_require__(22);
	var airconsole = new AirConsole({
	                      orientation: AirConsole.ORIENTATION_LANDSCAPE,
	                      device_motion: 100
	                    });
	// rateLimiter -> https://github.com/AirConsole/airconsole-controls/tree/master/rate-limiter                      
	var rateLimiter = new RateLimiter(airconsole);
	// viewMan -> https://github.com/AirConsole/airconsole-view-manager                    
	var viewMan = new AirConsoleViewManager(airconsole);
	var acTools = __webpack_require__(2)(airconsole);
	var storage = localStorage || {};
	var colors = ['black','white','blue','green','red','lightblue','yellow','purple'];
	var gameState;
	var autoCheckGyro = true;
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
	    if(!gyro.orientationDefault){
	      gyro.orientationDefault = gyro.getOrientation();
	    }
	    gyro.calibrate(function(){
	      viewMan.show("name-and-color");
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
	       if(gameState === 'level'){
	          var mov = process('beta', {x: 0, y:0});
	          mov = process('gamma', mov);
	          // console.log(mov.x + " - " + mov.y, mov);
	          moveGyro(mov);
	        }
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
	    gyro.init();
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

	/* WEBPACK VAR INJECTION */}.call(exports, __webpack_require__(21)))

/***/ },

/***/ 2:
/***/ function(module, exports) {

	module.exports = function(airconsole, devType){
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
	    
	    if(devType === 'screen'){
	      airconsole.onConnect = function(device_id) {
	      	// deviceConnectionChange();
	      	airconsole.setActivePlayers(20);
	      	console.log('connected: ', arguments);
	      };
	      
	      airconsole.onDisconnect = function(device_id) {
	        //var player = airconsole.convertDeviceIdToPlayerNumber(device_id);
	        //if (player != undefined) {
	        //  // Player that was in game left the game.
	        //  // Setting active players to length 0.
	        //  // airconsole.setActivePlayers(0);
	        //}
	        //deviceConnectionChange();
	      };
	      
	      // function deviceConnectionChange() {
	      //     var active_players = airconsole.getActivePlayerDeviceIds();
	      //     var connected_controllers = airconsole.getControllerDeviceIds();
	      //     // Only update if the game didn't have active players.
	      //     if (active_players.length == 0) {
	      //       if (connected_controllers.length >= 2) {
	      //         // Enough controller devices connected to start the game.
	      //         // Setting the first 2 controllers to active players.
	      //         airconsole.setActivePlayers(20);
	      //     //     resetBall(50, 0);
	      //     //     score = [0, 0];
	      //     //     score_el.innerHTML = score.join(":");
	      //     //     document.getElementById("wait").innerHTML = "";
	      //     //   } else if (connected_controllers.length == 1) {
	      //     //     document.getElementById("wait").innerHTML = "Need 1 more player!";
	      //     //     resetBall(0, 0);
	      //     //   } else if (connected_controllers.length == 0) {
	      //     //     document.getElementById("wait").innerHTML = "Need 2 more players!";
	      //     //     resetBall(0, 0);
	      //       }
	      //     }
	      //   }

	    }
	    
	    airconsole.onMessage = acTools.onMessage;
	    return acTools;
	}

/***/ },

/***/ 21:
/***/ function(module, exports) {

	// shim for using process in browser

	var process = module.exports = {};
	var queue = [];
	var draining = false;
	var currentQueue;
	var queueIndex = -1;

	function cleanUpNextTick() {
	    draining = false;
	    if (currentQueue.length) {
	        queue = currentQueue.concat(queue);
	    } else {
	        queueIndex = -1;
	    }
	    if (queue.length) {
	        drainQueue();
	    }
	}

	function drainQueue() {
	    if (draining) {
	        return;
	    }
	    var timeout = setTimeout(cleanUpNextTick);
	    draining = true;

	    var len = queue.length;
	    while(len) {
	        currentQueue = queue;
	        queue = [];
	        while (++queueIndex < len) {
	            if (currentQueue) {
	                currentQueue[queueIndex].run();
	            }
	        }
	        queueIndex = -1;
	        len = queue.length;
	    }
	    currentQueue = null;
	    draining = false;
	    clearTimeout(timeout);
	}

	process.nextTick = function (fun) {
	    var args = new Array(arguments.length - 1);
	    if (arguments.length > 1) {
	        for (var i = 1; i < arguments.length; i++) {
	            args[i - 1] = arguments[i];
	        }
	    }
	    queue.push(new Item(fun, args));
	    if (queue.length === 1 && !draining) {
	        setTimeout(drainQueue, 0);
	    }
	};

	// v8 likes predictible objects
	function Item(fun, array) {
	    this.fun = fun;
	    this.array = array;
	}
	Item.prototype.run = function () {
	    this.fun.apply(null, this.array);
	};
	process.title = 'browser';
	process.browser = true;
	process.env = {};
	process.argv = [];
	process.version = ''; // empty string to avoid regexp issues
	process.versions = {};

	function noop() {}

	process.on = noop;
	process.addListener = noop;
	process.once = noop;
	process.off = noop;
	process.removeListener = noop;
	process.removeAllListeners = noop;
	process.emit = noop;

	process.binding = function (name) {
	    throw new Error('process.binding is not supported');
	};

	process.cwd = function () { return '/' };
	process.chdir = function (dir) {
	    throw new Error('process.chdir is not supported');
	};
	process.umask = function() { return 0; };


/***/ },

/***/ 22:
/***/ function(module, exports) {

	module.exports = {
	    init: function(){
	      this.overTiltProtection();
	    },
	    actual:{
	      beta: 0,
	      gamma: 0
	    },
	    calibrated: false,
	    step: 0, // step of caliration
	    message: document.getElementById('calibrateMessage'),
	    button: document.getElementById('calibrateBtn'),
	    startOverBtn: document.getElementById('calStartOverBtn'),
	    debugMessage: document.getElementById('debugMessage'),
	    flipCor: 1,
	    MAX_BETA: -1000,
	    MIN_BETA: 1000,
	    MAX_GAMMA: -1000,
	    MIN_GAMMA: 1000,
	    dirToAxis: {
	      LEFT: "x",
	      RIGHT: "x",
	      UP: "y",
	      DOWN: "y"
	    },
	    dirToSign: {
	      LEFT: -1,
	      RIGHT: +1,
	      UP: -1,
	      DOWN: +1
	    },
	    getOrientation:function(){
	      return screen.orientation || screen.mozOrientation || screen.msOrientation || window.orientation;
	    },
	    overTiltProtection: function(){
	      var self = this;
	      var orientationOpposite = {
	        "-90": 90,
	        "90": -90,
	        "landscape-secondary": 'landscape-primary',
	        "landscape-primary": 'landscape-secondary'
	      };
	      window.addEventListener("orientationchange", function() {
	        if(!self.orientationDefault){
	          return;
	        }
	        
	        var currentOrientation = self.getOrientation();
	        if(currentOrientation === orientationOpposite[self.orientationDefault]){
	          document.body.classList.add('upside-down');
	          self.flipCor = -1;
	          
	        }else{
	          document.body.classList.remove('upside-down');
	          self.flipCor = 1;
	        }
	      });
	    },
	    calibrate: function(cb){
	      var self = this;
	      var steps = ['BEGIN', 'LEFT', 'RIGHT', 'UP', 'DOWN'];
	      
	      if(this.step === 0){
	        setMessages(steps[++this.step]);
	      }else if(this.step === 4){
	        this[steps[this.step]] = {beta: this.actual.beta, gamma: this.actual.gamma};
	        this.step = 1;
	        setMessages(steps[++this.step]);
	        this.calculateLimits();
	        this.calibrated = true;
	        if(cb){
	          cb(this);
	        }
	      }else{
	        this[steps[this.step]] = {beta: this.actual.beta, gamma: this.actual.gamma};
	        setMessages(steps[++this.step]);
	      }
	      
	      function setMessages(direction){
	          self.message.innerHTML = 'Now tilt your controller to desired maximum <b>' + direction + '</b> and then tap the button.';
	          self.button.innerHTML = 'MAX ' + direction;
	      }
	    },
	    calculateLimits: function(){
	      var sides = ['LEFT', 'RIGHT', 'UP', 'DOWN'];
	          
	      for (var i = 0; i < sides.length; i++) {
	        var side = sides[i],
	          beta = this[side].beta,
	          gamma = this[side].gamma;
	        if(beta < this.MIN_BETA){
	          this.MIN_BETA = beta;
	          this.MIN_BETA_SIDE = side;
	        }
	        if(beta > this.MAX_BETA){
	          this.MAX_BETA = beta;
	          this.MAX_BETA_SIDE = side;
	        }
	        if(gamma < this.MIN_GAMMA){
	          this.MIN_GAMMA = gamma;
	          this.MIN_GAMMA_SIDE = side;
	        }
	        if(gamma > this.MAX_GAMMA){
	          this.MAX_GAMMA = gamma;
	          this.MAX_GAMMA_SIDE = side;
	        }
	      }
	      
	      // GET CENTER
	      this.CENTER = {
	        beta: (this.MIN_BETA + this.MAX_BETA)/2,
	        gamma: (this.MIN_GAMMA + this.MAX_GAMMA)/2
	      };
	      
	      // NORMALISE
	      this.MIN_BETA -= this.CENTER.beta;
	      this.MAX_BETA -= this.CENTER.beta;
	      this.MIN_GAMMA -= this.CENTER.gamma;
	      this.MAX_GAMMA -= this.CENTER.gamma;
	    },
	    startOver: function(){
	      this.message.innerHTML = 'Tap "Begin" button to start calibration!';
	      this.button.innerHTML = 'Begin';
	      this.step = 1;
	    }
	};

/***/ }

/******/ });