module.exports = function (vmTools, storage, gyro) {
    var timeOutEnded = false,
        welcomeClicked = false;
    // timeout to get chance gyro/accelerators to fire tilt() function and so tell controller to use gyro functiuonality
    setTimeout(function(){
        timeOutEnded = true;
        goNext();
    }, 1000);
    document.getElementById('welcome').addEventListener('click', function welcomeClick() {
       welcomeClicked = true;
       goNext();
    });
    
    function goNext(){
      if(!timeOutEnded || !welcomeClicked){
          return;
      }
      if(storage.controller === 'Gyro'){
        gyro.init();
        vmTools.showWithCbs("gyro-calibration");
      }else{
        vmTools.showWithCbs("name-and-color");
      }
      storage.autoCheckGyro = false;
    }
};