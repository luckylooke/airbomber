module.exports = function(viewMan){
  var vmTools = {};
  vmTools.cbs = {}; // callbacks
  
  vmTools.showWithCbs = function(toView){
    console.log('showWithCbs toView', toView);
    var fromView = viewMan.current_view.self,
      fromViewCb = vmTools.cbs[fromView],
      toViewCb = vmTools.cbs[toView];
    viewMan.show(toView);
    if(fromViewCb && fromViewCb.from){
      fromViewCb.from(toView);
    }
    if(toViewCb && toViewCb.to){
      toViewCb.to(fromView);
    }
  };
  
  return vmTools;
};