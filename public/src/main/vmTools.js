module.exports = function(viewMan, storage, device){
  var vmTools = {};
  vmTools.cbs = {}; // callbacks
  
  vmTools.showWithCbs = function(toView){
    console.log('showWithCbs toView', toView);
    var fromView = viewMan.current_view.self,
      fromViewCb = vmTools.cbs[fromView],
      toViewCb = vmTools.cbs[toView];
    viewMan.show(toView);
    storage[device + 'CurrentView'] = toView;
    if(fromViewCb && fromViewCb.from){
      fromViewCb.from(toView);
    }
    if(toViewCb && toViewCb.to){
      toViewCb.to(fromView);
    }
  };
  
  return vmTools;
};