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
  }
}