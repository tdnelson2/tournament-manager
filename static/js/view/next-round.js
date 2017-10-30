var NextRoundView = {

  modalHTML: ''+
    '<!-- Modal -->'+
    '<div class="modal fade" id="nextModal" role="dialog">'+
      '<div class="modal-dialog">'+
        '<!-- Modal content-->'+
        '<div class="modal-content">'+
          '<div class="modal-header">'+
            '<button class="btn btn-primary" data-dismiss="modal" data-bind="text: nextText(), click: next"></button>'+
            '<button class="btn btn-secondary" data-dismiss="modal">I\'m Not Ready Yet</button>'+
          '</div>'+
        '</div>'+
      '</div>'+
    '</div>',

  populate: function(players, progress) {
    // Insert into DOM
    var $next = document.getElementById('next-round');
    $next.innerHTML = '';
    $next.innerHTML = '<div id="next-bindings"></div>';
    var $bindings = document.getElementById('next-bindings');
    $bindings.innerHTML = NextRoundView.modalHTML;

    $('#nextModal').modal('show');

    // Init binding
    ko.applyBindings( new NextRoundView.View(players, progress), $bindings );
  },

  View: function(players, progress) {
    var self = this;
    self.progress = progress;
    self.players = players;
    self.nextText = ko.pureComputed(function(){
      var r = NextRoundView.isLastRound(self.players);
      if( r !== undefined ) {
        return 'Crown \''+r+'\' The Champion!';
      }
      return 'Next Round';
    });

    self.next = function() {
      var status = progress.this_round >= progress.total_rounds
                   ? RoundStatus.FINAL_ROUND
                   : RoundStatus.NOT_FIRST_ROUND;
      NOTIFIER.notifySubscribers(status, "showPairingsView");
    };
  },

  isLastRound: function(players) {
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