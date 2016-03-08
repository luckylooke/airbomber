/* global AirConsole */
module.exports = function (airconsole, storage) {
    function bomb(setting) {
      airconsole.message(AirConsole.SCREEN, {
        listener: 'setBomb',
        nick: storage.nickname,
        setting: setting
      });
      console.log({
        listener: 'setBomb',
        nick: storage.nickname,
        setting: setting
      });
    }
    
    return bomb;
}