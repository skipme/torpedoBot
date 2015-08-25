var stateMachine = {
  
  states: {},
  clearStates: function()
  {
  },
  getStateContainer: function(chatid)
  {
    var stateobj;
    if(! (stateobj = this.states[chatid]))
    {
      return undefined;
    }
    return stateobj.container;
  },
  procState: function(scheme, user, chatid, text)
  {
    var cstate, statename, stateobj;
    if(! (stateobj = this.states[chatid]))
    {
      if(!scheme._def)
        throw new Error("please define default state: _def property");
      statename = scheme._def;
      cstate = scheme[statename];
      stateobj = this.setState(scheme, chatid, statename);
    }else{
      statename = stateobj.stateName;
      cstate = scheme[statename];
    }
    cstate.endpoint.call(this, stateobj, user, chatid, text);
  },
  setStateAndGo: function(scheme, user, chatid, stateName)
  {
    this.setState(scheme, chatid, stateName);
    this.procState(scheme, user, chatid, '/start');
  },
  setState: function(scheme, chatid, stateName)
  {
    var stateobj;
    if(! scheme[stateName])
      throw new Error("wrong stateName " + stateName);
    if(! (stateobj = this.states[chatid]))
    {
      stateobj = {
          stateName: stateName, 
          at: Date.now(),
          container: {},
          temp: {} // временный контейнер только для текущего шага
      };
      this.states[chatid] = stateobj;
    }
    else {
      stateobj.stateName = stateName;
      stateobj.at = Date.now();
      stateobj.temp = {}; // временный контейнер только для текущего шага - очищаем
    }
    return stateobj;
  }
};
exports.stateMachine = stateMachine;
            