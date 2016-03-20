/* global AirConsole */
module.exports = function (vmTools, storage, acTools, airconsole) {
    var colors = ['black','white','blue','green','red','lightblue','yellow','purple'];
    var colorsElm = document.getElementById('colors');
    var colorElm = colorsElm.children[0];
    var newColorElm;
    var isReady = false;

    var tmpNick;
    
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
   // document.getElementById('playerNotReady').addEventListener('click', playerNotReady);
    document.getElementById('player_nick').value = storage.nick || '';

    
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
        acTools.addListener('playerReady', function(from, data){
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

        storage.forcedDpad = document.getElementById('dpadSettings').checked;
        
        // start contacting screen
        storage.acInterval = setInterval(function(){
          airconsole.message(AirConsole.SCREEN, {listener: 'playerReady'});
        }, 3000);

        sendPlayerDataToScreen();
    }
    
    function changeLockOnSettings(action){
        if (action == 'unlock'){
            isReady = false;
            document.getElementById('player_nick').disabled  = false;
            document.getElementById('color-lock').style.display = 'none';
            document.getElementById('dpadSettings').disabled    = false;
        }
        else if (action == 'lock' ){
            isReady = true;
            document.getElementById('player_nick').disabled  = true;
            document.getElementById('color-lock').style.display = 'block';
            document.getElementById('dpadSettings').disabled    = true;
            
        }
    }
    
    function sendPlayerDataToScreen(){
        storage.controller = JSON.parse(storage.forcedDpad) ? 'DPad' : storage.controllerAuto;
        
       if(storage.color && storage.nick && storage.gameState === 'pending-game'){
          airconsole.message(AirConsole.SCREEN, {
            listener: 'playerReady',
            nick: storage.nick,
            newNick: tmpNick !== storage.nick ? tmpNick : undefined,
            color: storage.color,
            controller: storage.controller,
            ready: isReady

          });
        }
    }
    
    function getPlayerData(){
        storage.color = getColor();
        
        if(storage.nick){
            tmpNick = '' + getNick();
        }else{
            storage.nick = getNick();
        }
    }
    
    function getColor(){
        var el = document.getElementsByClassName('selected');
        
        if(!el[0]){
            return;
        }
        color = el[0].style.backgroundColor;
           
        return color ? color : '';
    }
    
    function getNick(){
        return document.getElementById('player_nick').value;
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