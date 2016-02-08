navigator.vibrate = (navigator.vibrate ||
                         navigator.webkitVibrate ||
                         navigator.mozVibrate ||
                         navigator.msVibrate);

    var airconsole;
    /**
     * Sets up the communication to the screen.
     */
    function init() {
      airconsole = new AirConsole({"orientation": "portrait"});

      /*
       * Checks if this device is part of the active game.
       */
      airconsole.onActivePlayersChange = function(player) {
        var div = document.getElementById("player_id");
        if (player !== undefined) {
          div.innerHTML =  (["Left Player", "Right Player"][player]);
        } else {
          div.innerHTML = "It's a 2 player game!";
        }
      };

      /*
       * Makes the device vibrate if the screen says so.
       */
      airconsole.onMessage = function(from, data) {
        if (from == AirConsole.SCREEN && data.vibrate) {
          navigator.vibrate(data.vibrate);
          console.log("Vibrating: " + data.vibrate);
        }
      };
    }

    /**
     * Tells the screen to move the paddle of this player.
     * @param amount
     */
    function move(amount) {
      airconsole.message(AirConsole.SCREEN, {move: amount})
    }