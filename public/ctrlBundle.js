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
/******/ ([
/* 0 */
/***/ function(module, exports, __webpack_require__) {

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
	var gyro = __webpack_require__(1)(storage);
	var vmTools = __webpack_require__(3)(viewMan, storage);
	var acTools = __webpack_require__(4)(airconsole);
	var bomb = __webpack_require__(5)(airconsole, storage);

	__webpack_require__(6)(vmTools, storage, gyro);
	__webpack_require__(7)(vmTools, storage, acTools, airconsole);
	__webpack_require__(8)(vmTools, gyro, storage);
	__webpack_require__(9)(vmTools, storage, rateLimiter, bomb);
	__webpack_require__(10)(vmTools, gyro, storage, rateLimiter, bomb);

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


/***/ },
/* 1 */
/***/ function(module, exports, __webpack_require__) {

	/* WEBPACK VAR INJECTION */(function(process) {module.exports = function(storage){
	  var TILT_LIMITER_RATE = 200; // [ms] of minimal time between tilt function executions
	  var STILL_SNAP = 10; // [%] of movement to be considered as still player
	  var gyro = {
	    init: function(){
	      this.overTiltProtection();
	      if(storage.gyroCalibrated){
	        this.MAX_BETA = storage.MAX_BETA;
	        this.MAX_BETA_SIDE = storage.MAX_BETA_SIDE;
	        this.MIN_BETA = storage.MIN_BETA;
	        this.MIN_BETA_SIDE = storage.MIN_BETA_SIDE;
	        this.MAX_GAMMA = storage.MAX_GAMMA;
	        this.MAX_GAMMA_SIDE= storage.MAX_GAMMA_SIDE;
	        this.MIN_GAMMA = storage.MIN_GAMMA;
	        this.MIN_GAMMA_SIDE= storage.MIN_GAMMA_SIDE;
	        this.CENTER.beta = storage.CENTER_BETA;
	        this.CENTER.gamma = storage.CENTER_GAMMA;
	      }
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
	    CENTER: {beta:0, gamma:0},
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
	      
	      if(this.step === 0 && !storage.gyroCalibrated){
	        setMessages(steps[++this.step]);
	      }else if(this.step === 4 || storage.gyroCalibrated){
	        if(!storage.gyroCalibrated){
	          this[steps[this.step]] = {beta: this.actual.beta, gamma: this.actual.gamma};
	          this.startOver();
	          this.calculateLimits();
	          storage.gyroCalibrated = true;
	          
	          storage.MAX_BETA = this.MAX_BETA;
	          storage.MAX_BETA_SIDE = this.MAX_BETA_SIDE;
	          storage.MIN_BETA = this.MIN_BETA;
	          storage.MIN_BETA_SIDE = this.MIN_BETA_SIDE;
	          storage.MAX_GAMMA = this.MAX_GAMMA;
	          storage.MAX_GAMMA_SIDE= this.MAX_GAMMA_SIDE;
	          storage.MIN_GAMMA = this.MIN_GAMMA;
	          storage.MIN_GAMMA_SIDE= this.MIN_GAMMA_SIDE;
	          storage.CENTER_BETA = this.CENTER.beta;
	          storage.CENTER_GAMMA = this.CENTER.gamma;
	        }
	        
	        this.calibrated = true;
	        
	        if(cb){
	          cb(this);
	        }
	      }else{ // step 1 to 3
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
	      this.step = 0;
	      this.message.innerHTML = 'Tap "Begin" button to start calibration!';
	      this.message.innerHTML = 'Begin';
	    },
	    tilt: function(data){
	      if(this.tiltLimiter()){
	        return;
	      }
	      if(gyro.calibrated){
	         if(storage.gameState === 'Level'){
	            var mov = process('beta', {x: 0, y:0});
	            mov = process('gamma', mov);
	            // console.log(mov.x + " - " + mov.y, mov);
	            this.output(mov);
	          }
	      }else{
	        if(storage.controller !== 'Gyro' && (data.gamma || data.beta)){
	          storage.controller = storage.autoCheckGyro ? 'Gyro' : storage.controller;
	        }
	        gyro.actual = data; // for calibration
	      }
	      
	      function process(name, mov){
	        var value = data[name],
	          axis, dir, sign, abs;
	        
	        if(value > gyro.CENTER[name]){
	          dir = gyro['MAX_' + name.toUpperCase() + '_SIDE'];
	          axis = gyro.dirToAxis[dir];
	          value = Math.abs(value - gyro.CENTER[name]) / Math.abs(gyro['MAX_' + name.toUpperCase()]);
	        }else{
	          dir = gyro['MIN_' + name.toUpperCase() + '_SIDE'];
	          axis = gyro.dirToAxis[dir];
	          value = Math.abs(value - gyro.CENTER[name]) / Math.abs(gyro['MIN_' + name.toUpperCase()]);
	        }
	        
	        sign = value > 0 ? 1 : -1;
	        abs = Math.abs(value);
	        if(abs > 1){
	          value = 1*sign;
	        }else if(abs < STILL_SNAP/100){
	          value = 0;
	        }
	        
	        value *= gyro.dirToSign[dir];
	        value *= gyro.flipCor;
	        mov[axis] = value;
	        return mov;
	      }
	    },
	    tiltLimiter: function(){
	      if(this.tiltLimit){
	        return true;
	      }else{
	        var self = this;
	        this.tiltLimit = true;
	        setTimeout(function(){
	          self.tiltLimit = false;
	        }, TILT_LIMITER_RATE);
	        return false;
	      }
	    },
	    output:function output(mov) {
	      console.log('output ', mov);
	    }
	  };
	  return gyro;
	};
	/* WEBPACK VAR INJECTION */}.call(exports, __webpack_require__(2)))

/***/ },
/* 2 */
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
/* 3 */
/***/ function(module, exports) {

	module.exports = function(viewMan, storage){
	  var vmTools = {};
	  vmTools.cbs = {}; // callbacks
	  
	  vmTools.showWithCbs = function(toView){
	    console.log('showWithCbs toView', toView);
	    var fromView = viewMan.current_view.self,
	      fromViewCb = vmTools.cbs[fromView],
	      toViewCb = vmTools.cbs[toView];
	    viewMan.show(toView);
	    storage.currentView = toView;
	    if(fromViewCb && fromViewCb.from){
	      fromViewCb.from(toView);
	    }
	    if(toViewCb && toViewCb.to){
	      toViewCb.to(fromView);
	    }
	  };
	  
	  return vmTools;
	};

/***/ },
/* 4 */
/***/ function(module, exports) {

	/* global AirConsole */
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
	    acTools.getCurrentView = function(device, cb){
	      if(device === airconsole.getDeviceId()){
	        return acTools.currentView;
	      }
	      airconsole.message(device, {listener: 'currentView'});
	      if(cb)
	       acTools.addListener('currentViewAnswer', cbOnce(cb));
	    };
	    acTools.addListener('currentView', function(device_id){
	      var view = acTools.getCurrentView(airconsole.getDeviceId());
	      airconsole.message(device_id, {listener: 'currentViewAnswer', currentView: view});
	    });
	    
	    if(devType === 'screen'){
	      airconsole.onConnect = function(device_id) {
	      	// deviceConnectionChange();
	      	airconsole.setActivePlayers(20);
	      	console.log('connected: ', arguments);
	      };
	    }
	    
	    airconsole.onMessage = acTools.onMessage;
	    return acTools;
	    
	    function cbOnce(cb){
	      return function(){
	        cb.apply(this, arguments);
	        acTools.rmListener('screenCurrentView');
	      };
	    }
	};

/***/ },
/* 5 */
/***/ function(module, exports) {

	/* global AirConsole */
	module.exports = function (airconsole, storage) {
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
	    
	    return bomb;
	}

/***/ },
/* 6 */
/***/ function(module, exports) {

	module.exports = function (vmTools, storage, gyro) {
	    var timeOutEnded = false,
	        welcomeClicked = false;
	    // timeout to get chance gyro/accelerators to fire tilt() function and so tell controller to use gyro functiuonality
	    setTimeout(function(){
	        timeOutEnded = true;
	        goNext();
	    }, 1000);
	    document.getElementById('welcome').addEventListener('click', function welcomeClick() {
	       welcomeClicked = true;
	       goNext();
	    });
	    
	    function goNext(){
	      if(!timeOutEnded || !welcomeClicked){
	          return;
	      }
	      if(storage.controller === 'Gyro'){
	        gyro.init();
	        vmTools.showWithCbs("gyro-calibration");
	      }else{
	        vmTools.showWithCbs("name-and-color");
	      }
	      storage.autoCheckGyro = false;
	    }
	};

/***/ },
/* 7 */
/***/ function(module, exports) {

	/* global AirConsole */
	module.exports = function (vmTools, storage, acTools, airconsole) {
	    var colors = ['black','white','blue','green','red','lightblue','yellow','purple'];
	    var colorsElm = document.getElementById('colors');
	    var colorElm = colorsElm.children[0];
	    var newColorElm;
	    
	    colorsElm.innerHTML = '';
	    for (var i = 0; i < colors.length; i++) {
	    	var color = colors[i];
	    	newColorElm = colorElm.cloneNode(true);
	    	newColorElm.setAttribute('src', 'resource/icon_' + color + '.png');
	    	if(storage.color === color){
	    	  newColorElm.classList.add('selected');
	    	}
	    	colorsElm.appendChild(newColorElm);
	    }
	    
	    document.getElementById('name-and-color').addEventListener('click',function(e){
	      	var clickedElement = e.target;
	      	if (clickedElement.classList.contains('player-color')){
	      	  unselectAll(clickedElement);
	      	  clickedElement.classList.add('selected');
	      	}
	    });
	    document.getElementById('addPlayer').addEventListener('click', addPlayer);
	    document.getElementById('player_name').value = storage.nickname || '';
	    
	     vmTools.cbs['name-and-color'] = {
	      from: function(){
	        console.log('TEST name-and-color from');
	      },
	      to: function(){
	        console.log('TEST name-and-color to');
	      }
	    };
	    
	    function addPlayer(){
	        getPlayerInfo();
	        // if(storage.color && storage.nickname){
	        //   if(storage.controller === 'Gyro'){
	        //     vmTools.showWithCbs("gyro-pad");
	        //   }else{
	        //     vmTools.showWithCbs("d-pad");
	        //   }
	        // }
	        acTools.addListener('ready', function(from, data){
	          if(storage.color && storage.nickname && from == AirConsole.SCREEN && storage.gameState === 'PendingGame'){
	            clearInterval(storage.acInterval);
	            airconsole.message(AirConsole.SCREEN, {
	              listener: 'newPlayer',
	              nick: storage.nickname,
	              color: storage.color,
	              controller: storage.controller
	            });
	          }
	          if(data.gameState){
	            storage.gameState = data.gameState;
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
	};

/***/ },
/* 8 */
/***/ function(module, exports) {

	module.exports = function (vmTools, gyro, storage) {
	    document.getElementById('calibrateBtn').addEventListener('click', calibrate);
	    document.getElementById('calStartOverBtn').addEventListener('click', gyro.startOver);
	    
	    function calibrate(){
	        if(!gyro.orientationDefault){
	          gyro.orientationDefault = gyro.getOrientation();
	        }
	        gyro.calibrate(function(){
	          vmTools.showWithCbs("name-and-color");
	        });
	    }
	    
	    vmTools.cbs['gyro-pad'] = {
	    to: function(){
	        if(storage.gyroCalibrated){
	          vmTools.showWithCbs("name-and-color");
	        }
	      }
	    };
	};

/***/ },
/* 9 */
/***/ function(module, exports) {

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
	  
	  vmTools.cbs['d-pad'] = {
	    to: function(){
	      if(storage.screenView !== 'Level'){
	        vmTools.showWithCbs('welcome');
	      }
	    }
	  };
	};

/***/ },
/* 10 */
/***/ function(module, exports) {

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

/***/ }
/******/ ]);