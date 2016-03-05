/* global io */
module.exports = function(bomberman){
  function getURLParameter(name) {
    return decodeURIComponent((new RegExp('[?|&]' + name + '=' + '([^&;]+?)(&|#|;|$)').exec(location.search)||[,""])[1].replace(/\+/g, '%20'))||null;
  }
  
  var once = false;
  var socketServer;
  if(getURLParameter('cloud9')){
      socketServer = 'cloud9';
      bomberman.socket = io(); // cloud9
  }else{
      socketServer = 'openshift';
      bomberman.socket = io('http://airbomber-luckylooke.rhcloud.com:8000'); // openshift
  }
  bomberman.socket.on('connect_error', function(err){
      if(!once){ // try once fallback to cloud9
          bomberman.socket = io(); // cloud9
          socketServer = 'cloud9';
          once = true;
      }else{
          console.log('SOCKET CANNOT CONNECT', err);
      }
  });
  bomberman.socket.on('connect', function(){
      console.log('socket server: ', socketServer);
      bomberman.game.state.start('Boot');
  });
};