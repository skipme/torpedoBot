(function(){ 
//var some_req = require('fdaaxccID').other_endpoint;
//exports.some_endpoint = function(){return 'ok';}
  var _botpass = "botXXXX";
	var _messageOffset = -1;
    var stateMachine = script.require("55a2f5ce15665d1fb84b4b55").stateMachine;
    var battle = script.require("55c0da10701674bb6438bd89").battle;
   var onliner = script.require("55c14db07016744e50b66c19").online;

  function visualMapEnemySmouge(field, emoji)
  {
    var lines = '';
    for(var i = 0; i <10; i++)
    {
      for(var j = 0; j <10; j++)
      {
        if(emoji)
         lines += field[i][j].enemyBombed?(field[i][j].ship?"?":"??") :"??";//¦?-
          else
        lines += field[i][j].enemyBombed?(field[i][j].ship?"X":"-") :"-";//¦?-
      }
      lines+="\n";
    }
    return lines;
  }
  
  var MSG = {
    'M_CHOOSE_MODE': 'Choose game mode /cpu (play with bot) or /online',
    'M_CHOOSE_DONE_MODE': "You are chosed mode which allow to play with bot",
    'M_CHOOSE_DONE_ONLINEERR': "You are choosed mode online, this mode is under construction, check back later",
    // PLACE SHIPS
    "R_CHOOSE_PLACERND": "Place ships for you /random ? Or by yourself /manually ?",
    'M_CHOOSE_PLACE_MANUAL': "You are choosed manually mode to place ships, this unavailable now, field automatically generated for you.",
    
    'R_SELECT_SHIP': 'Please select ship, to place on field',
    'R_SELECT_CELL': 'Please select cell to place ship',
    
    
  };
  function getShipsForSelection()
  {
    return [
      {ship: [[1],[1],[1],[1]], name: '4cell horisontal', left: 1, id: '4c'},
      {ship: [[1,1,1,1]], name: '4cell vertical', left: 1, id: '4c'},
      {ship: [[1],[1],[1]], name: '3cell horisontal', left: 2, id: '3c'},
      {ship: [[1,1,1]], name: '3cell vertical', left: 2, id: '3c'},
      {ship: [[1],[1]], name: '2cell horisontal', left: 3, id: '2c'},
      {ship: [[1,1]], name: '2cell vertical', left: 3, id: '2c'},
      {ship: [[1]], name: '1cell', left: 4, id: '1c'},
    ];
  }
  function createKeyboardSheeps()
  {
  }
  function createKeyboardFieldForShot(field)
  {
    var result = [];
    if(field)
    {
      for(var i = 0; i< 10; i++)
      {
        result[i]=[];
        for(var j = 0; j < 10; j++)
        {
          if(field[i][j].enemyBombed)
         	result[i][j] = field[i][j].ship?'?':'??';
          else result[i][j] = 'ABCDEFGHIJ'[i]+""+'0123456789'[j];
        }
      }
       return result
    }else{
      
      for(var i = 0; i< 10; i++)
      {
        result[i]=[];
        for(var j = 0; j < 10; j++)
        {
         result[i][j] = 
           //'-';//
          'ABCDEFGHIJ'[i]+""+'0123456789'[j];
        }
      }
      return result
    }
    
  }
  console.log(createKeyboardFieldForShot(battle.genMap()))
 
 var onlinePairs = 0;
  var TMAC = {
      _def: "START",
      START: {
        endpoint: function(state, user, chatid, text)
        {
          var cmd = tcommand(text);
          var _STC = state.container;
          var _TMP = state.temp;
          function sendthmnustart(mtext)
          {
              var kbrd = [['/cpu ??','/online ??'], ['/emoji map ?? '+(_STC.emoji?"??":""), '/char map -'+(_STC.emoji?"":"??")]];
              send(chatid, mtext, {keyboard: kbrd, one_time_keyboard: false});
          }
          switch(cmd)
          {
            case 'start':
              if(_STC.emoji === undefined)
              	_STC.emoji = false;
              
              sendthmnustart(MSG.M_CHOOSE_MODE +' (' +onliner.queueLength()+" waiting, "+onlinePairs+" pairs gaming right now online)");
              break;
            case 'char':
              _STC.emoji = false;
              sendthmnustart('emoji set off, the maps will be printed in ansi pseudographics');
              break;
            case 'emoji':
              _STC.emoji = true;
              sendthmnustart('emoji set on, the maps will be printed with emoji, warning - mobile client does not support emoji sequences with length > 50, you can disable emoji maps with /char command ');
              break;
            case 'cpu':
               if(_TMP.on_waiting){
                onliner.remove(chatid);
                _TMP.on_waiting = false;
               }
              send(chatid, MSG.M_CHOOSE_DONE_MODE);
              this.setStateAndGo(TMAC, user, chatid, 'PLACE_SHIPS')
              break;
             case 'stop':
              if(_TMP.on_waiting){
                onliner.remove(chatid);
                _TMP.on_waiting = false;
              }
              sendthmnustart('Not in wait list now.');
              break;
            case 'online':
              //send(chatid, MSG.M_CHOOSE_DONE_ONLINEERR);
              _STC.chatid = chatid;
              _STC.username = (user.first_name?user.first_name:"") + " " + (user.last_name?user.last_name:"");
              var regresult = onliner.registerWait(chatid);
              if(regresult === 0)
              {
                send(_STC.chatid, 'Wait please...  or /stop ');
                _TMP.on_waiting = true;
              }else{
                console.log('соединяю')
                var ENEMYCONTAINER = this.getStateContainer(regresult);
                ENEMYCONTAINER.ENEMY = _STC;
                _STC.ENEMY = ENEMYCONTAINER;
                ENEMYCONTAINER.initial = true;
                _STC.waiting = true;
                send(_STC.chatid, 'You are gaming with '+ENEMYCONTAINER.username+". While waiting for your turn, you can send messages. The ships are placed randomly. \n Wait for your turn.");
                send(ENEMYCONTAINER.chatid, 'You are gaming with '+_STC.username+". While waiting for your turn, you can send messages. The ships are placed randomly.");
                this.setStateAndGo(TMAC, {}, chatid, 'ONLINE')
                this.setStateAndGo(TMAC, {}, ENEMYCONTAINER.chatid, 'ONLINE')
                onlinePairs++;
              }
              break;
            default:
              sendthmnustart(MSG.M_CHOOSE_MODE);
              break;
          }
        }
      },
    ONLINE: {
       endpoint: function(state, user, chatid, text)
        {
          var cmd = tcommand(text);
          var _STC = state.container;
          var _TMP = state.temp;
          var ENEMY = _STC.ENEMY;
          switch(cmd)
          {
            case 'stop':
              if(_TMP.ingame){
                send(chatid, 'Successfully quit.');
                send(ENEMY.chatid, 'Your opponent disconnected.');
                onlinePairs--;
                this.setStateAndGo(TMAC, {}, ENEMY.chatid, 'START')
               this.setStateAndGo(TMAC, user, chatid, 'START')
              }
            break;
            case 'emoji':
              _STC.emoji = true;
              send(chatid, 'emoji set on, the maps will be printed with emoji, warning - mobile client does not support emoji sequences with length > 50, you can disable emoji maps with /char command');
              break;
            case 'char':
              _STC.emoji = false;
               send(chatid, 'emoji set off, the maps will be printed in ansi pseudographics');
              break;
            case 'start':
              if(_TMP.ingame)
              {
                send(chatid, 'You are gaming with `'+ENEMY.username+'`, use /stop for disconnection.');
                return;
              }
              //send(chatid, MSG.R_CHOOSE_PLACERND, {keyboard: [['/random ??'],['/manually ?']], one_time_keyboard: false});
              _STC.context = battle.ecpuModel();
               _STC.field = battle.genMap();
               battle.placeShipsRandom(_STC.field);
              if(_STC.initial)
              {
                send(chatid, 'It is your turn', {keyboard: createKeyboardFieldForShot(ENEMY.field), one_time_keyboard: false});
              }else{
              }
              _TMP.ingame = true;
              break;
            default:
              if(_STC.waiting)
              {
                if(text.length <= 4)
                {
                  send(chatid, 'You are waiting your turn from `'+ENEMY.username+'`, use /stop for disconnection. The message length to opponent must be longer than 4 symbols.');
                  return;
                }
                // посылаем что бы это ни было
                 send(ENEMY.chatid, _STC.username+" >> "+text);
              }else if(text.length === 2)
              {
                var i = 'ABCDEFGHIJ'.indexOf(text[0]);
                var j = '0123456789'.indexOf(text[1]);
                //console.log('u shot', i, j);
                if(i>=0 && j>=0)
                { 
                  var result;
                  result = battle.userStep(_STC.context, ENEMY.field, i, j);
                  //var rtext = ['промах','ранен','убит', "последего убили"];
                 
                  var sideEventsLog = '';
                  if(result === 0)
                  { 
                    send(chatid, "Missed, wait for your turn from `"+ENEMY.username+"`", {keyboard: createKeyboardFieldForShot(ENEMY.field), one_time_keyboard: false});
                    send(ENEMY.chatid, "He missed, your map: \n"+battle.visualMap(ENEMY.field, ENEMY.emoji)+"\n It is your turn.", {keyboard: createKeyboardFieldForShot(_STC.field), one_time_keyboard: false});
                    _STC.waiting = true;
                    ENEMY.waiting = false;
                  }else if(result ===3)
                  {
                    onlinePairs--;
                    
                    send(chatid, 'ENEMY map:\n'+battle.visualMap(ENEMY.field, _STC.emoji)+'\nYOU LOSE ??.');
                    send(ENEMY.chatid, 'ENEMY map:\n'+battle.visualMap(_STC.field, ENEMY.emoji)+'\nYOU WON ??.');
                    this.setStateAndGo(TMAC, user, chatid, 'START')
                    this.setStateAndGo(TMAC, {}, ENEMY.chatid, 'START')
                    
                    return;
                  }else if(result ===2)
                  {
                    send(chatid, "Hit and killed, MAKE ANOTHER SHOT.", {keyboard: createKeyboardFieldForShot(ENEMY.field), one_time_keyboard: false});
                    send(ENEMY.chatid, _STC.username+" hit and kill, your map: \n"+battle.visualMap(ENEMY.field, ENEMY.emoji), {keyboard: createKeyboardFieldForShot(_STC.field), one_time_keyboard: false});
                    
                  }else if(result ===1)
                  {
                    send(chatid, "Hit and injured, MAKE ANOTHER SHOT.", {keyboard: createKeyboardFieldForShot(ENEMY.field), one_time_keyboard: false});
                    send(ENEMY.chatid, _STC.username+" hit and injured, your map: \n"+battle.visualMap(ENEMY.field, ENEMY.emoji), {keyboard: createKeyboardFieldForShot(_STC.field), one_time_keyboard: false});
                   }
                  //send(chatid, rtext[result], {keyboard: createKeyboardFieldForShot(_TMP.cpufield), one_time_keyboard: false});
                }
                else
                {
                   send(chatid, "It is your turn.", {keyboard: createKeyboardFieldForShot(ENEMY.field), one_time_keyboard: false});
                }
                  
              }else
              {
                send(chatid, "It is your turn.", {keyboard: createKeyboardFieldForShot(ENEMY.field), one_time_keyboard: false});
              }
              break;
          }
        }
    },
    PLACE_SHIPS: {
      endpoint: function(state, user, chatid, text)
        {
          var cmd = tcommand(text);
          var _STC = state.container;
          var _TMP = state.temp;
          switch(cmd)
          {
         
            case 'start':
              send(chatid, MSG.R_CHOOSE_PLACERND, {keyboard: [['/random ??'],['/manually ?']], one_time_keyboard: false});
              break;
            case 'manually':
               send(chatid, MSG.M_CHOOSE_PLACE_MANUAL);
             // break;
            case 'random':
               _STC.context = battle.ecpuModel();
               _STC.field = battle.genMap();
               battle.placeShipsRandom(_STC.field);
               this.setStateAndGo(TMAC, user, chatid, 'CPU_GAME')
              break;
            default:
              send(chatid, MSG.R_CHOOSE_PLACERND, {keyboard: [['/random ??'],['/manually ?']], one_time_keyboard: false});
              break;
          }
        }
    },
    CPU_GAME: {
      endpoint: function(state, user, chatid, text)
      {
          var cmd = tcommand(text);
          var _STC = state.container;
          var _TMP = state.temp;
          switch(cmd)
          {
            case 'emoji':
              _STC.emoji = true;
              send(chatid, 'emoji set on, the maps will be printed with emoji, warning - mobile client does not support emoji sequences with length > 50, you can disable emoji maps with /char command');
              break;
             case 'char':
              _STC.emoji = false;
               send(chatid, 'emoji set off, the maps will be printed in ansi pseudographics');
              break;
            case 'stop':
              if(_TMP.ingame){
                send(chatid, 'You are quit.');
               this.setStateAndGo(TMAC, user, chatid, 'START')
              }
              break;
            case 'start':
              if(_TMP.ingame)
              {
                send(chatid, 'You are in game? Use /stop command for quit');
                return;
              }
              _TMP.cpugame = battle.ecpuModel();
              _TMP.cpufield = battle.genMap();
               battle.placeShipsRandom(_TMP.cpufield);
              send(chatid, 'Make a first shot!', {keyboard: createKeyboardFieldForShot(_TMP.cpufield), one_time_keyboard: false});
              _TMP.ingame = true;
              break;
            default:
              if(text.length === 2)
              {
                var i = 'ABCDEFGHIJ'.indexOf(text[0]);
                var j = '0123456789'.indexOf(text[1]);
                //console.log('u shot', i, j);
                if(i>=0 && j>=0)
                { 
                  var result;
                  result = battle.userStep(_STC.context, _TMP.cpufield, i, j);
                  var rtext = ['промах','ранен','убит', "последего убили"];
                 
                  var sideEventsLog = '';
                  if(result === 0)
                  { 
                    var result = 1;
                    //var selogm = ['Рука наводчика дрогнула, противник промазал'];
                    //var selogh = ['Тысяча чертей, поражен ваш корабль,'];
                    var hurt = 0, kill = 0;
                    while(result === 1 || result === 2)
                    {
                      result = battle.ecpuStep(_TMP.cpugame, _STC.field);
                      if(result === 1)
                        hurt++;
                      else if(result === 2)
                      {
                        //hurt = 0;
                        hurt++;
                        kill++;
                      }
                      
                    }
                    sideEventsLog += "Enemy - shots: "+hurt+"; killed: "+kill+"\n";
                    if(kill>0)
                    {
                      sideEventsLog+="ПОЛУ?НДРА ??\n";
                    }
                    if(result === 3)
                    {
                      send(chatid, sideEventsLog+'YOU LOSE ??'+', your map:\n'+battle.visualMap(_STC.field, _STC.emoji)+'\n enemy map:\n'+battle.visualMap(_TMP.cpufield, _STC.emoji));
                      this.setStateAndGo(TMAC, user, chatid, 'START')
                      return;
                    }
                    send(chatid, 'Your map:\n'+battle.visualMap(_STC.field, _STC.emoji)+'\n'+sideEventsLog+"\nMissed ??", {keyboard: createKeyboardFieldForShot(_TMP.cpufield), one_time_keyboard: false});
                    
                  }else if(result ===3)
                  {
                    send(chatid, 'Enemy map:\n'+battle.visualMap(_TMP.cpufield, _STC.emoji)+'\nYOU WON.');
                    this.setStateAndGo(TMAC, user, chatid, 'START')
                    return;
                  }else if(result ===2)
                  {
                    send(chatid, 'Enemy map:\n'+ visualMapEnemySmouge(_TMP.cpufield, _STC.emoji)+'\nHit and kill. Your shot now.', {keyboard: createKeyboardFieldForShot(_TMP.cpufield), one_time_keyboard: false});
                  }else if(result ===1)
                  {
                    send(chatid, 'Enemy map:\n'+ visualMapEnemySmouge(_TMP.cpufield, _STC.emoji)+'\nHit and injured. Your shot now', {keyboard: createKeyboardFieldForShot(_TMP.cpufield), one_time_keyboard: false});
                  }
                  //send(chatid, rtext[result], {keyboard: createKeyboardFieldForShot(_TMP.cpufield), one_time_keyboard: false});
                }
              }
              break;
          }
      }
    }
  }
  function tcommand(text)
  {
    var coms = text.indexOf('/');
    if(coms>=0)
    { 
      var spc = text.indexOf(' ', coms);
      return text.substring(coms+1, spc>0?spc:text.length);
    }
  }
  	function send(To, text, markup)
	{
      if(To === -100)
      {
        To = 0000;// отладка
        text = "-100_DBG>>>" + text;
      }
        for(var j = 0; j<text.length; j+=4000)
        {
          var offset = ((j+4000)>=text.length) ? text.length : j+4000;
          var mparam = ((j+4000)>=text.length) ? markup : null;
		  telegram.sendMessage(_botpass, To, text.substring(j, offset), mparam);
        }
	}
  // ######################################################################
  	function botEndPoint(updateObj)
	{
		console.log("kick at", (new Date()), typeof updateObj, updateObj);

		if(!updateObj)
		{
			updateObj = telegram.getUpdates(_botpass, _messageOffset +1, 10);
			//console.log("updateObj ", updateObj );
            if(!updateObj || !updateObj.result || updateObj.result.length === 0)
                return;

            if(updateObj.result[updateObj.result.length-1].update_id === undefined)
            {
                console.log("updateObj wrong updateid", updateObj);
                return;
            }
		}
        if(typeof(updateObj.update_id) === 'number')
        {
            var converting = [updateObj];
            updateObj = {result: converting };
        }

		for(var i = 0; i < updateObj.result.length; i++)
		{
 			try{
               var msg = updateObj.result[i].message;
 			   stateMachine.procState(TMAC, msg.from, msg.chat.id, msg.text);

 			}catch(exc)
 			{
 				console.log("processText error: ", msg.chat.id , msg.text, exc);
 			}

		}
		_messageOffset = updateObj.result[updateObj.result.length-1].update_id;
	}
    botHttp.subscribe("torpedo", botEndPoint, undefined, 
     -1);
    //5000);
}());
