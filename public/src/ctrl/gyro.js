module.exports = function(storage){
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
         if(storage.gameState === 'level'){
            var mov = process('beta', {x: 0, y:0});
            mov = process('gamma', mov);
            // console.log(mov.x + " - " + mov.y, mov);
            this.output(mov);
          }
      }else{
        if(storage.controller !== 'Gyro' && (data.gamma || data.beta)){
          storage.controllerAuto = storage.autoCheckGyro ? 'Gyro' : storage.controller;
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