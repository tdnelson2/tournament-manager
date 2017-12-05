var NextRoundView = {

  populate: function(players, progress, tournament) {

    // Insert into DOM
    var html = ModalPrompt.html.slice().replace(/%MODAL-ID%/g, 'next');

    var $bindings = utilities.addToDOM('next-round', html);

    $('#next').on('shown.bs.modal', function () {
        $('#nextPrimary').focus();
    });

    // Init binding
    ko.applyBindings( new NextRoundView.View(players, progress, tournament), $bindings );
  },

  View: function(players, progress, tournament) {
    var self = this;
    self.progress = progress;
    self.players = players;
    self.tournament = tournament;

    self.modalCSS = ko.pureComputed(function(){
      return 'modal-dialog modal-sm modal-prompt';
    });

    self.primaryText = ko.pureComputed(function(){
      var r = utilities.overallWinner(self.players);
      if( r !== undefined ) {
        return 'Crown \''+r+'\' The Champion!';
      }
      return 'Next Round';
    });

    self.primaryAction = function() {
      var data = {
        tournament : self.tournament,
        status : status
      };
      NOTIFIER.notifySubscribers(self.tournament, "showStandingsView");
    };

    self.secondaryText = ko.pureComputed(function(){
      return 'I\'m Not Ready Yet';
    });

    self.secondaryAction = function(){ return; };

    $('#next').modal('show');
  }
};