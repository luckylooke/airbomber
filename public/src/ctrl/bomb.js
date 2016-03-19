/* global AirConsole */
module.exports = function (airconsole, storage) {
    function bomb(setting) {
      airconsole.message(AirConsole.SCREEN, {
        listener: 'setBomb',
        nick: storage.nick,
        setting: setting
      });
      console.log({
        listener: 'setBomb',
        nick: storage.nick,
        setting: setting
      });
    }
    
    return bomb;
}