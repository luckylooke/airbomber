var gyro = {
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
      gyro.message.innerHTML = 'Tap "Begin" button to start calibration!';
      gyro.button.innerHTML = 'Begin';
      gyro.step = 1;
    }
};

module.exports = gyro;