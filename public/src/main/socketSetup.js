/* global bomberman */
module.exports = function(io, game){
  function getURLParameter(name) {
    return decodeURIComponent((new RegExp('[?|&]' + name + '=' + '([^&;]+?)(&|#|;|$)').exec(location.search)||[,""])[1].replace(/\+/g, '%20'))||null;
  }
  
  var once = false;
  var socketServer;
  var socket;
  if(getURLParameter('cloud9')){
      socketServer = 'cloud9';
      socket = io(); // cloud9
  }else{
      socketServer = 'openshift';
      socket = io('http://airbomber-luckylooke.rhcloud.com:8000'); // openshift
  }
  socket.on('connect_error', function(err){
      if(!once){ // try once fallback to cloud9
          socket = io(); // cloud9
          socketServer = 'cloud9';
          once = true;
      }else{
          console.log('SOCKET CANNOT CONNECT', err);
      }
  });
  socket.on('connect', function(){
      console.log('socket server: ', socketServer);
      bomberman.acTools.currentView = 'Boot';
      game.state.start('Boot');
  });
  return socket;
};