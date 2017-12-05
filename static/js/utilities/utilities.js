var utilities = {
  overallWinner: function(players) {
    var champion = '';
    var zeroLossCount = 0;
    // Determine how many players still have a perfect record
    players().map(function(x){
      if(x.wins()-x.matches() === 0){
        zeroLossCount += 1;
        champion = x.name();
      }
    });
    // If there's only one, we have a champion
    console.log('number of players with perfect record: '+zeroLossCount);
    if(zeroLossCount === 1) {
      console.log('champion is '+champion);
      return champion;
    }
    console.log('no champion yet');
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
    for (var i = 0; i < items().length; i++) {
        if(items()[i] === targetID) {
            return i;
        }
    }
    return -1;
  },

  isGuestMode: function() {

    // Get the last path component of pages url.
    var lastPathComponent = function(loc) {
      return loc.pop() || loc.pop();
    };
    var loc = window.location.href.split('/');
    var seg = lastPathComponent(loc);
    if(seg === '#'){
      seg = lastPathComponent(loc);
    }
    return seg.toLowerCase() === 'guest';
  }
};