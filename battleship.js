(function(){ 
//var some_req = require('fdaaxccID').other_endpoint;
//exports.some_endpoint = function(){return 'ok';}
  var bt = {};
  
  var f_id_top = 'ABCDEFGHIJ';
  var f_id_bot = '12345678910';
  
  bt.genMap = function()
  {
    var field = [];
    for(var i = 0; i< 10; i++)
    {
      field[i] = [];
      for(var j = 0; j < 10; j++)
      {
        field[i][j] = {ship: false, enemyBombed: false};
      }
    }
    return field;
  }
  bt.genGroups = function()
  {
    return [
      {count: 4, inFocus: false, killed: false},
      {count: 3, inFocus: false, killed: false},{count: 3, inFocus: false, killed: false},
      
      {count: 2, inFocus: false, killed: false},{count: 2, inFocus: false, killed: false},
      {count: 2, inFocus: false, killed: false},
      
       {count: 1, inFocus: false, killed: false},{count: 1, inFocus: false, killed: false},
       {count: 1, inFocus: false, killed: false}, {count: 1, inFocus: false, killed: false}
           ];
  }
  bt.getId = function(i,j)
  {
    //return i+"-"+j
    return f_id_top[i]+""+f_id_bot[j];
  }
  function shuffle(o){
    for(var j, x, i = o.length; i; j = Math.floor(Math.random() * i), x = o[--i], o[i] = o[j], o[j] = x);
    return o;
}
  bt.ecpuModel = function()
  {
    var m = {//field: bt.genMap(), 
             stepsLeft: undefined, // все возможные ходы отшафленые, минус ходы сделаные, i*100 + j
             //fieldDone: bt.genMap(),// заносятся сделанные ходы, если рядом с предыдущем ходом есть пустые клетки то их атакуем в первую очередь
             enemyShips: bt.genGroups(), // корабли противника по оставшимся можно определить кто в фокусе если попали сейчас
             prevShot: undefined,
             prevPrevShot: undefined,
             hurtShots: 0
            };
    var stepfull = [];
    /*for(var i = 0; i < 10; i++)
    {
      for(var j = 0; j < 10; j++)
      {
        stepfull.push(i*10 + j);
      }
    }*/
    for(var i = 0; i < 100; i++)
    {
      // j = parseInt(i%10)
      // i = parseInt(i/10)
      stepfull.push(i);
    }

    m.stepsLeft = shuffle(stepfull);
    return m;
  }
  bt.shot = function(field, i, j)
  {
    // miss, hurt, kill
    // 0 , 1 , 2
    // if(field[i][j].enemyBombed)
    //  console.log('!ALREADY SHOT', i, j, field[i][j]);
    //else console.log('SHOT', i, j);
    field[i][j].enemyBombed = true;
    
    if(!field[i][j].ship)
      return 0; // miss
    
    //if( (i < 9 && field[i +1][j].ship && !field[i +1][j].enemyBombed) || (i > 0 && field[i -1][j].ship && !field[i -1][j].enemyBombed))
    //  return 1;
    //if( (j < 9 && field[i][j +1].ship && !field[i][j +1].enemyBombed) || (j > 0 && field[i][j -1].ship && !field[i][j -1].enemyBombed))
    //  return 1;
    
    var vertical = (j<9 && field[i][j+1].ship)
                        || (j>0 && field[i][j-1].ship);
    var horisontal = (i<9 && field[i+1][j].ship)
                        || (i>0 && field[i-1][j].ship);
    if(vertical)
    {
      //traverse top
      for(var lj=j-1; lj>=0; lj--)
      {
        if(!field[i][lj].ship)
          break;
        else if(!field[i][lj].enemyBombed)
          return 1;
      }

      //traverse bottom
      for(var lj=j+1; lj<=9; lj++)
      {
        if(!field[i][lj].ship)
          break;
        else if(!field[i][lj].enemyBombed)
          return 1;
      }

    }else if(horisontal)
    {
      //traverse left
      for(var li=i-1; li>=0; li--)
      {
        if(!field[li][j].ship)
          break;
        else if(!field[li][j].enemyBombed)
          return 1;
      }

      //traverse right
      for(var li=i+1; li<=9; li++)
      {
        if(!field[li][j].ship)
          break;
        else if(!field[li][j].enemyBombed)
          return 1;
      }

    }
    
    return 2;
  }
  
  //********************************************************************************
  bt.ecpuStep = function(model, enemyField)
  {
    if(model.stepsLeft.length < 1)
    {
      return 3;
    }
    var currentShot = {i: -1, j: -1}
    var shotCandidates = [];

    function tryAddCandidate(i,j)
    {
      if(i > 9 || j > 9 || i<0 || j<0)
        return;
      var shi = parseInt(i*10+j);
      if(model.stepsLeft.indexOf(shi) >= 0)
        shotCandidates.push({'i': i, 'j': j});
    }
    function removeStep(i, j, disableSim)
    {
      if(i > 9 || j > 9 || i<0 || j<0)
        return;
      var id = model.stepsLeft.indexOf(parseInt(i*10+j));
      if(id>=0)
      {
        model.stepsLeft.splice(id, 1);
        if(!disableSim)
        {
          //console.log('SHOT sim', i, j, id, parseInt(i*10+j));
          enemyField[i][j].enemyBombed = true;
        }
      }
      else 
      {
        // can happen, don't do int this anything
      }
    }
    if(model.prevShot)
    {
      shotCandidates = [];
      if(model.prevPrevShot)
      {
          var horisontal = model.prevShot.j === model.prevPrevShot.j;
          if(horisontal){
            tryAddCandidate(model.prevShot.i+1, model.prevShot.j);
            tryAddCandidate(model.prevShot.i-1, model.prevShot.j);
          }else{
            tryAddCandidate(model.prevShot.i, model.prevShot.j+1);
            tryAddCandidate(model.prevShot.i, model.prevShot.j-1);
          }
          if(shotCandidates.length === 0)
          {
            if(horisontal)
            {
              //console.log("horisontal", model.prevShot, model.hurtShots)
              if(model.prevShot.i > model.prevPrevShot.i)
              {
                currentShot.i = model.prevShot.i - model.hurtShots;
              }else{
                 currentShot.i = model.prevShot.i + model.hurtShots;
              }
              currentShot.j = model.prevShot.j;
            }else{
              //console.log("vertical", model.prevShot, model.hurtShots)
              if(model.prevShot.j > model.prevPrevShot.j)
              {
                currentShot.j = model.prevShot.j - model.hurtShots;
              }else{
                 currentShot.j = model.prevShot.j + model.hurtShots;
              }
              currentShot.i = model.prevShot.i;
            }
            //console.log("p]rediction", currentShot, model.prevShot, model.prevPrevShot, model.hurtShots, horisontal?'HOR':"VER");
          }else{

            currentShot = shotCandidates[Math.floor(Math.random() * shotCandidates.length)]
            //console.log("c]andidated by line", currentShot, model.prevShot, model.prevPrevShot, horisontal?'HOR':"VER");
          
          }
        }else{
          tryAddCandidate(model.prevShot.i+1, model.prevShot.j);
          tryAddCandidate(model.prevShot.i-1, model.prevShot.j);
          tryAddCandidate(model.prevShot.i, model.prevShot.j+1);
          tryAddCandidate(model.prevShot.i, model.prevShot.j-1);
          
          //console.log("f]ull candidates", currentShot, model.prevShot, model.prevPrevShot, horisontal?'HOR':"VER");
          currentShot = shotCandidates[Math.floor(Math.random() * shotCandidates.length)]
        }
      //console.log('chosed candidate', bt.getId(model.prevShot.i, model.prevShot.j),
      //            model.prevPrevShot,
      //            currentShot, shotCandidates.length)
      removeStep(currentShot.i, currentShot.j, true)
      
    }else
    {

      var cs = model.stepsLeft.shift();
      currentShot.i = parseInt(cs/10);
      currentShot.j = parseInt(cs%10);
    }

    {

      var shotResult = bt.shot(enemyField, currentShot.i, currentShot.j);

      if(shotResult === 0)
      {
        //if(model.prevShot)
        //  console.log('-]shot:', bt.getId(currentShot.i, currentShot.j), 'miss')
          
        return 0;
      }
      else if(shotResult === 1)
      {
        removeStep(currentShot.i+1, currentShot.j+1)
        removeStep(currentShot.i-1, currentShot.j-1)
        removeStep(currentShot.i+1, currentShot.j-1)
        removeStep(currentShot.i-1, currentShot.j+1)
        
        model.hurtShots++;
        model.prevPrevShot = model.prevShot;
        model.prevShot = currentShot;
        //console.log('shot:', bt.getId(currentShot.i, currentShot.j), 'hurt')
        return 1;
      }
      else if(shotResult === 2)
      {
        removeStep(currentShot.i+1, currentShot.j+1)
        removeStep(currentShot.i-1, currentShot.j-1)
        removeStep(currentShot.i+1, currentShot.j-1)
        removeStep(currentShot.i-1, currentShot.j+1)
        // really it's a kill????
        // остались ли корабли с таким количеством палуб?
    
        removeStep(currentShot.i+1, currentShot.j)
        removeStep(currentShot.i-1, currentShot.j)
        removeStep(currentShot.i, currentShot.j+1)
        removeStep(currentShot.i, currentShot.j-1)
        
        if(!model.enemyShips.some(function(sh, idx){
          if(!sh.killed && sh.count === model.hurtShots+1)
          {
            model.enemyShips[idx].killed = true;
            //console.log("ship with", sh.count, 'killed by ai');
            return true;
          }
        }))
        {
         console.log('can`t find ship what i kill now....???',  model.hurtShots, model.enemyShips);
        }
        // close opposite edge
        if(model.prevShot)
        {
          var horisontal = currentShot.j === model.prevShot.j;
          if(horisontal){
            if(currentShot.i > model.prevShot.i)
              removeStep(currentShot.i-model.hurtShots-1, currentShot.j)
            else 
              removeStep(currentShot.i+model.hurtShots+1, currentShot.j)
          }else{
            if(currentShot.j > model.prevShot.j)
              removeStep(currentShot.i, currentShot.j-model.hurtShots-1)
            else 
              removeStep(currentShot.i, currentShot.j+model.hurtShots+1)
          }
        }else if(model.hurtShots ===0)
        {
          removeStep(currentShot.i, currentShot.j+1)
          removeStep(currentShot.i, currentShot.j-1)
          removeStep(currentShot.i+1, currentShot.j)
          removeStep(currentShot.i-1, currentShot.j)
        }else{
          console.log('can;t close opposite edge', model.hurtShots+1);
        }
        model.hurtShots=0;
        model.prevShot = undefined;
        model.prevPrevShot = undefined;
        if(!model.enemyShips.some(function(sh, idx){
          return !sh.killed;
        }))
        {
          return 3;
        }
        return 2;
      }
    }
  }
   bt.userStep = function(model, enemyField, shotI, shotJ)
  {
     
    if(enemyField[shotI][shotJ].enemyBombed)
      return 0;
    var currentShot = {i: shotI, j: shotJ}

    function removeStep(i, j, disableSim)
    {
       if(i > 9 || j > 9|| i<0||j<0)
        return;
     enemyField[i][j].enemyBombed = true;
    }
   
    {
      var shotResult = bt.shot(enemyField, currentShot.i, currentShot.j);

      if(shotResult === 0)
      {
        //if(model.prevShot)
        //  console.log('-]shot:', bt.getId(currentShot.i, currentShot.j), 'miss')
          
        return 0;
      }
      else if(shotResult === 1)
      {
        removeStep(currentShot.i+1, currentShot.j+1)
        removeStep(currentShot.i-1, currentShot.j-1)
        removeStep(currentShot.i+1, currentShot.j-1)
        removeStep(currentShot.i-1, currentShot.j+1)
        
        //model.hurtShots++;
        //model.prevPrevShot = model.prevShot;
        //model.prevShot = currentShot;
        //console.log('shot:', bt.getId(currentShot.i, currentShot.j), 'hurt')
        return 1;
      }
      else if(shotResult === 2)
      {
        removeStep(currentShot.i+1, currentShot.j+1)
        removeStep(currentShot.i-1, currentShot.j-1)
        removeStep(currentShot.i+1, currentShot.j-1)
        removeStep(currentShot.i-1, currentShot.j+1)
        // really it's a kill????
        // остались ли корабли с таким количеством палуб?
    
        removeStep(currentShot.i+1, currentShot.j)
        removeStep(currentShot.i-1, currentShot.j)
        removeStep(currentShot.i, currentShot.j+1)
        removeStep(currentShot.i, currentShot.j-1)
        
        var hits = 0;
        var vertical = (currentShot.j<9 && enemyField[currentShot.i][currentShot.j+1].ship)
                        || (currentShot.j>0 && enemyField[currentShot.i][currentShot.j-1].ship);
        if(vertical)
        {
          //traverse top
          for(var lj=currentShot.j; lj>=0&&enemyField[currentShot.i][lj].ship; lj--)
          {
            hits++;
          }
          removeStep(currentShot.i, lj)
          //traverse bottom
          for(var lj=currentShot.j+1; lj<=9&&enemyField[currentShot.i][lj].ship; lj++)
          {
            hits++;
          }
          removeStep(currentShot.i, lj)
        }else
        {
          //traverse left
          for(var li=currentShot.i; li>=0&&enemyField[li][currentShot.j].ship; li--)
          {
            hits++;
          }
          removeStep(li, currentShot.j)
          //traverse right
          for(var li=currentShot.i+1; li<=9&&enemyField[li][currentShot.j].ship; li++)
          {
            hits++;
          }
          //close edges
          removeStep(li, currentShot.j)
        }
        
        if(!model.enemyShips.some(function(sh, idx){
          if(!sh.killed && sh.count === hits)
          {
            model.enemyShips[idx].killed = true;
            //console.log("ship with", sh.count, 'killed by usr');
            return true;
          }
        }))
        {
         console.log('can`t find ship what i kill now....???',  hits, JSON.stringify(model.enemyShips,null, 2));
          console.log(bt.visualMap(enemyField))
        }
        // close opposite edge


        
        model.hurtShots=0;
        model.prevShot = undefined;
        model.prevPrevShot = undefined;
        if(!model.enemyShips.some(function(sh, idx){
          return !sh.killed;
        }))
        {
          return 3;
        }
        
        return 2;
      }
    }
  }
  bt.placeShip = function(field, ship, Li, Lj)
  {
    for(var i = 0; i< 10; i++)
    {
      for(var j = 0; j < 10; j++)
      {
      
        field[i][j].ship = (i>=Li && (i-Li)< (ship.length))?(j>=Lj && (j-Lj)<ship[i-Li].length):0;
  
      }
    }
  }
  
  bt.visualMap = function(field,emoji)
  {
    var lines = '';
    for(var i = 0; i <10; i++)
    {
      for(var j = 0; j <10; j++)
      {
        //lines += field[i][j].ship?(field[i][j].enemyBombed?"X":"0") :(field[i][j].enemyBombed?"*":"-")
        //lines += field[i][j].ship?(field[i][j].enemyBombed?"X":"-") :(field[i][j].enemyBombed?"-":"-");//¦?-??
        if(emoji)
        	lines += field[i][j].ship?(field[i][j].enemyBombed?"?":"??") :(field[i][j].enemyBombed?"??":"??");//¦?-
        else 
          lines += field[i][j].ship?(field[i][j].enemyBombed?"X":"-") :(field[i][j].enemyBombed?"-":"-");//¦?-??
      }
      lines+="\n";
    }
    return lines;
  }
  bt.visualSteps = function(steps)
  {
    var mp = bt.genMap();
    for(var i = 0; i < steps.length; i++)
    {
      var l = steps[i];
      mp[parseInt(l/10)][l%10].ship = 1;
    }
    return bt.visualMap(mp);
  }
  bt.placeShipsRandom = function(field)
  {
    var ships = [ 
      [ [[1,1,1,1]], [[1],[1],[1],[1]] ],
      [ [[1,1,1]], [[1],[1],[1]] ], [ [[1,1,1]], [[1],[1],[1]] ],
      [ [[1,1]], [[1],[1]] ], [ [[1,1]], [[1],[1]] ], [ [[1,1]], [[1],[1]] ],
      [ [[1]] ], [ [[1]] ], [ [[1]] ], [ [[1]] ]
      ];
    var coords = [];
    function removeStep(i, j)
    {
      if(i > 9 || j > 9)
        return;
      var id = coords.indexOf(parseInt((i*10)+j));
      if(id>=0)
      {
        coords.splice(id, 1);
      }
    }
    for(var i = 0; i < 100; i++)
    {
      coords.push(i);
    }
    //console.log(bt.visualSteps(coords));
    shuffle(coords);
    
    for(var s = 0; s < ships.length; s++)
    {
      var ship = ships[s]
      //[0];
      [Math.floor(Math.random() * ships[s].length)];
      //console.log(ship)
      var ci = -1,cj, vertical = false; 
      if(ship.length>1)
      {
        var fok = false;
        // horisontal
        for(var xz = 0; xz < coords.length; xz++)
        {
          ci = parseInt(coords[xz]/10);
          cj = coords[xz]%10;
          if(ci+ship.length > 10)
            continue;
          if(ci+ship.length <= 9)
          {
            if(coords.indexOf(parseInt((ci+ship.length)*10+cj))<0)
              continue;
            
            if(cj>0)
              if(coords.indexOf(parseInt((ci+ship.length)*10+(cj-1)))<0)
                continue;
            if(cj<9)
              if(coords.indexOf(parseInt((ci+ship.length)*10+(cj+1)))<0)
                continue;

          }
          if(ci > 0)
          {
            if(coords.indexOf(parseInt((ci-1)*10+cj))<0)
              continue;
            
            if(cj>0)
              if(coords.indexOf(parseInt((ci-1)*10+(cj-1)))<0)
                continue;
            if(cj<9)
              if(coords.indexOf(parseInt((ci-1)*10+(cj+1)))<0)
                continue;
          }
          var ok = true;
          for(var ti = 0; ti < ship.length; ti++)
          {
            if(cj>0 && coords.indexOf(parseInt((ci+ti)*10+cj-1))<0)
            {
              ok=false;
              break;
            }
            if(cj<9 && coords.indexOf(parseInt((ci+ti)*10+cj+1))<0)
            {
              ok=false;
              break;
            }
          }
          if(ok)
          { 
            fok = true;
            break;
          }
          
        }
        if(!fok)
        {
          
          console.log('H place not found', JSON.stringify(coords), ship,"\n", bt.visualSteps(coords));
          console.log(battle.visualMap(field));
        }
      }else
      {
        // vertical
        vertical = true; var fok = false;
        for(var xz = 0; xz < coords.length; xz++)
        {
          ci = parseInt(coords[xz]/10);
          cj = coords[xz]%10;
          if(cj+ship[0].length > 10)
            continue;
          if(cj+ship[0].length <= 9)
          {
            if(coords.indexOf(parseInt(ci*10+(cj+ship[0].length)))<0)
              continue;
            
            if(ci>0)
              if(coords.indexOf(parseInt((ci-1)*10+(cj+ship[0].length)))<0)
                continue;
            if(ci<9)
              if(coords.indexOf(parseInt((ci+1)*10+(cj+ship[0].length)))<0)
                continue;
          }
          if(cj > 0)
          {
            if(coords.indexOf(parseInt(ci*10+(cj-1)))<0)
              continue;
            if(ci>0)
              if(coords.indexOf(parseInt((ci-1)*10+(cj-1)))<0)
                continue;
            if(ci<9)
              if(coords.indexOf(parseInt((ci+1)*10+(cj-1)))<0)
                continue;
          }
          var ok = true;
          for(var tj = 0; tj < ship[0].length; tj++)
          {
            if(ci<9 && coords.indexOf(parseInt((ci+1)*10+ cj+tj))<0)
            {
              ok=false;
              break;
            }
            if(ci>0 && coords.indexOf(parseInt((ci-1)*10+ cj+tj))<0)
            {
              ok=false;
              break;
            }
          }
          if(ok)
          { 
            fok = true;
            break;
          }
        }
        if(!fok)
        {
          
          console.log('V place not found', JSON.stringify(coords), ship,"\n\n"+ bt.visualSteps(coords));
          console.log(battle.visualMap(field));
        }
      }

      //console.log(ci,cj)
      for(var i = 0; i< 10; i++)
      {
        for(var j = 0; j < 10; j++)
        {
          var sh = (i>=ci && (i-ci)< (ship.length))?(j>=cj && (j-cj)<ship[i-ci].length):0;
          if(sh)
          {
          	field[i][j].ship = sh;
            removeStep(i,j);
 
          }
        }
      }
      //console.log(visualMap(f));
    }
  }
  exports['battle'] = bt;
}());