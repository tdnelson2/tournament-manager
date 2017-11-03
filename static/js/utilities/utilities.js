var utilities = {
  overallWinner: function(players) {
    var champion = '';
    var zeroLossCount = 0;
    players().map(function(x){
      if(x.wins()-x.matches() === 0){
        zeroLossCount += 1;
        champion = x.name()
      }
    });
    if(zeroLossCount === 1) {
      return champion;
    }
    return undefined;
  },

  addToDOM: function(target, html) {
    var $target = document.getElementById(target);
    $target.innerHTML = '';
    $target.innerHTML = '<div id="'+target+'-bindings"></div>';
    var $bindings = document.getElementById(target+'-bindings');
    $bindings.innerHTML = html;
    return $bindings;
  },

  sanitize: function(s) {
    return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  },

  indexOfID: function(items, targetID) {
    for (var i = 0; i < item().length; i++) {
        if(items()[i] === thisTournament) {
            return i;
        }
    }
    return -1;
  }
};