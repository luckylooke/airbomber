/* global AirConsole */
module.exports = function (vmTools, storage, acTools, airconsole) {
    var colors = ['black','white','blue','green','red','lightblue','yellow','purple'];
    var colorsElm = document.getElementById('colors');
    var colorElm = colorsElm.children[0];
    var newColorElm;
    var ready = false;
    
    if(!storage.color){
        storage.color = 'black';
    }
    
    colorsElm.innerHTML = '';
    for (var i = 0; i < colors.length; i++) {
    	var color = colors[i];
    	newColorElm = colorElm.cloneNode(true);
    	newColorElm.style.backgroundColor = color;
    	if(storage.color === color){
    	  newColorElm.classList.add('selected');
    	}
    	colorsElm.appendChild(newColorElm);
    }
    
    changeCharacterColor();
    
    document.getElementById('name-and-color').addEventListener('click',function(e){
      	var clickedElement = e.target;
      	if (clickedElement.classList.contains('player-color')){
      	  unselectAll(clickedElement);
      	  clickedElement.classList.add('selected');
      	  
      	  //zmenim character obrazok podla farby
      	  changeCharacterColor();
      	}
    });
    document.getElementById('playerReady').addEventListener('click', playerReady);
    document.getElementById('playerNotReady').addEventListener('click', playerNotReady);
    document.getElementById('player_name').value = storage.nick || '';
    
     vmTools.cbs['name-and-color'] = {
      from: function(){
        console.log('TEST name-and-color from');
      },
      to: function(){
        console.log('TEST name-and-color to');
      }
    };
    
    function playerReady(){
        getPlayerData();
        // if(storage.color && storage.nick){
        //   if(storage.controller === 'Gyro'){
        //     vmTools.showWithCbs("gyro-pad");
        //   }else{
        //     vmTools.showWithCbs("d-pad");
        //   }
        // }
        acTools.addListener('ready', function(from, data){
          if(from == AirConsole.SCREEN){
            clearInterval(storage.acInterval);
            sendPlayerDataToScreen();  
            if(data.gameState){
              storage.gameState = data.gameState;
            }
          }
        });
        ready = true;
        sendPlayerDataToScreen();
    }
    
    function playerNotReady(){
        ready = false;
        sendPlayerDataToScreen();
    }
    
    function sendPlayerDataToScreen(){
       if(storage.color && storage.nick && storage.gameState === 'pending-game'){
          airconsole.message(AirConsole.SCREEN, {
            listener: 'playerReady',
            nick: storage.nick,
            color: storage.color,
            controller: storage.controller,
            ready: ready
          });
        }
    }
    
    function getPlayerData(){
        storage.color = getColor();
        storage.nick = getName();
    }
    
    function getColor(){
        var el = document.getElementsByClassName('selected');
        
        if(!el[0]){
            return;
        }
        color = el[0].style.backgroundColor;
           
        return color ? color : '';
    }
    
    function getName(){
        return document.getElementById('player_name').value;
    }
      
    function unselectAll(clickedElement){
        
        //zmenim character obrazok podla farby
        var allCharacters = document.getElementsByClassName(clickedElement.className);
        for(var i = 0; i < allCharacters.length; i++)
          allCharacters[i].classList.remove('selected');
    }
    
    function changeCharacterColor(){
        var character = document.getElementById('playerCharacter');
        var characterColor = getColor();
        character.style.backgroundImage = "url(resource/icon_" + characterColor + ".png)";
    }
};