/* global AirConsole */
module.exports = function (vmTools, storage, acTools, airconsole) {
    var colors = ['black','white','blue','green','red','lightblue','yellow','purple'];
    var colorsElm = document.getElementById('colors');
    var colorElm = colorsElm.children[0];
    var newColorElm;
    var isReady = false;
    
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
        //if player is READY he wont be able to change color
        if(isReady == 'true')
            return;
            
      	var clickedElement = e.target;
      	if (clickedElement.classList.contains('player-color')){
      	  unselectAll(clickedElement);
      	  clickedElement.classList.add('selected');
      	  
      	  //zmenim character obrazok podla farby
      	  changeCharacterColor();
      	}
    });
    document.getElementById('playerReady').addEventListener('click', playerReady);
    //document.getElementById('playerNotReady').addEventListener('click', playerNotReady);
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
        console.log(storage.ready);
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
        if (isReady == 'false' || isReady == false){
            changeLockOnSettings('lock');
        }
        else{
            changeLockOnSettings('unlock');
        }
        sendPlayerDataToScreen();
    }
    
    function playerNotReady(){
        sendPlayerDataToScreen();
    }
    
    function changeLockOnSettings(action){
        if (action == 'unlock'){
            isReady = false;
            document.getElementById('player_name').disabled  = false;
            document.getElementById('color-lock').style.display = 'none';
            document.getElementById('dpadSettings').disabled    = false;
        }
        else if (action == 'lock' ){
            isReady = true;
            document.getElementById('player_name').disabled  = true;
            document.getElementById('color-lock').style.display = 'block';
            document.getElementById('dpadSettings').disabled    = true;
            
        }
    }
    
    function sendPlayerDataToScreen(){
       if(storage.color && storage.nick && storage.gameState === 'pending-game'){
          airconsole.message(AirConsole.SCREEN, {
            listener: 'playerReady',
            nick: storage.nick,
            color: storage.color,
            controller: storage.controller,
            ready: isReady
          });
        }
    }
    
    function getPlayerData(){
        storage.color = getColor();
        storage.nick = getName();
    }
    
    function getColor(){
        var el = document.getElementsByClassName('selected');
        
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