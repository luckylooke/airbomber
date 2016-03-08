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
        if(storage.color && storage.nickname){
          if(storage.controller === 'Gyro'){
            vmTools.showWithCbs("gyro-pad");
          }else{
            vmTools.showWithCbs("d-pad");
          }
        }
        acTools.addListener('ready', function(from, data){
          if(storage.color && storage.nickname && from == AirConsole.SCREEN && storage.gameState === 'pending_game'){
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