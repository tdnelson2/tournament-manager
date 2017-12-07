var utilities = {
  overallWinner: function(players) {
    if(players().length > 0) {
      var matchesCount = players()[0].matches();
      var champion = '';
      var zeroLossCount = 0;
      // Determine how many players still have a perfect record
      for (var i = 0; i < players().length; i++) {
        var x = players()[i];
        if(x.matches() !== matchesCount) {
          zeroLossCount = 0;
          champion = undefined;
          break;
        }
        if(x.wins()-x.matches() === 0){
          zeroLossCount += 1;
          champion = x.name();
        }
      }

      // If there's only one, we have a champion
      if(zeroLossCount === 1) {
        return champion;
      }
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