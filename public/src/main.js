/* global Phaser, bomberman, io */
if(!bomberman) {
    bomberman = {};
}

bomberman.width = bomberman.bomberElm.clientWidth;
bomberman.height = bomberman.bomberElm.clientHeight;

var game = bomberman.game = new Phaser.Game(bomberman.width, bomberman.height, Phaser.AUTO, 'bomber');
bomberman.screen = {};

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
    game.state.start('Boot');
});
bomberman.level = null;

game.state.add("Boot", require("./game/states/boot"));
game.state.add("Preloader", require("./game/states/preloader"));
game.state.add("Lobby", require("./game/states/lobby"));
game.state.add("StageSelect", require("./game/states/stage_select"));
game.state.add("PendingGame", require("./game/states/pending_game"));
game.state.add("Level", require("./game/states/level"));
game.state.add("GameOver", require("./game/states/game_over"));

require.context("./game/", true, /\.js$/);undefined
