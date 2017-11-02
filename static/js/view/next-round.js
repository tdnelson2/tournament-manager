var NextRoundView = {
    // top margin is 25px
    // right margin is 50px
    // bottom margin is 75px
    // left margin is 100px

  modalHTML: ''+
    '<!-- Modal -->'+
    '<div class="modal fade" id="nextModal" role="dialog">'+
      '<div class="modal-dialog modal-sm" style="max-width:325px;">'+
        '<div class="modal-content">'+
            '<div class="modal-body">'+
            '<div class="container-fluid">'+
              '<form class="text-center">'+
                        '<button id="goToNextRound" type="submit" class="btn btn-primary" style="margin:5px 0 0 0;" data-dismiss="modal" data-bind="text: nextText(), click: next"></button>'+
                        '<button type="button" class="btn btn-secondary" style="margin:5px 0 0 0;" data-dismiss="modal">I\'m Not Ready Yet</button>'+
              '</form>'+
              '</div>'+
            '</div>'+
        '</div>'+
      '</div>'+
    '</div>',

  populate: function(players, progress) {
    // Insert into DOM
    var $bindings = utilities.addToDOM('next-round', NextRoundView.modalHTML);

    $('#nextModal').on('shown.bs.modal', function () {
        $('#goToNextRound').focus();
    })

    $('#nextModal').modal('show');

    // Init binding
    ko.applyBindings( new NextRoundView.View(players, progress), $bindings );
  },

  View: function(players, progress) {
    var self = this;
    self.progress = progress;
    self.players = players;
    self.nextText = ko.pureComputed(function(){
      var r = utilities.overallWinner(self.players);
      if( r !== undefined ) {
        return 'Crown \''+r+'\' The Champion!';
      }
      return 'Next Round';
    }); 

    NOTIFIER.subscribe(function(tournament_id) {
        $('#nextModal').modal('hide');
    }, self, "hideAllExceptDashboard");

    self.next = function() {
      var status = progress.this_round >= progress.total_rounds
                   ? RoundStatus.FINAL_ROUND
                   : RoundStatus.NOT_FIRST_ROUND;
      NOTIFIER.notifySubscribers(status, "showPairingsView");
    };
  }
};