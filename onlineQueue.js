(function(){ 
//var some_req = require('fdaaxccID').other_endpoint;
//exports.some_endpoint = function(){return 'ok';}
  var online = {};
  var waitqueue = [];
  online.queueLength = function()
  {
    return waitqueue.length;
  }

  online.registerWait = function(id)
  {
    // 0 - added to wait, >0 - connected to id
    if(waitqueue.indexOf(id) >= 0)
      return 0;
    if(waitqueue.length > 0)
    {
      return waitqueue.shift();
    }
    waitqueue.push(id);
    return 0;
  }
  online.remove = function(id)
  {
    var zid;
    if((zid = waitqueue.indexOf(id)) >= 0)
    {
      waitqueue.splice(zid,1);
    }
  }
  
  exports.online = online;
}());
