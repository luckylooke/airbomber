module.exports = function (vmTools, gyro) {
    document.getElementById('calibrateBtn').addEventListener('click', calibrate);
    document.getElementById('calStartOverBtn').addEventListener('click', gyro.startOver);
    
    function calibrate(){
        if(!gyro.orientationDefault){
          gyro.orientationDefault = gyro.getOrientation();
        }
        gyro.calibrate(function(){
          vmTools.showWithCbs("name-and-color");
        });
    }
};