

var AddTournamentView = {
	html : ''+
          '<div class="modal fade" id="newTournamentModal" tabindex="-1" role="dialog" aria-labelledby="newTournamentModalLabel" aria-hidden="true">'+
            '<div class="modal-dialog" role="document">'+
              '<div class="modal-content">'+
                '<div class="modal-header">'+
                  '<h5 class="modal-title" id="newTournamentModalLabel">New Tournament</h5>'+
                  '<button type="button" class="close" data-dismiss="modal" aria-label="Close">'+
                    '<span aria-hidden="true">&times;</span>'+
                  '</button>'+
                '</div>'+
                  '<form>'+
	                '<div class="modal-body">'+
	                    '<div class="form-group">'+
	                      '<label for="recipient-name" class="form-control-label">Give your tournament a name:</label>'+
	                      '<input type="text" id="tournamentNameInput" class="form-control" data-bind="value: tournamentInput">'+
	                    '</div>'+
	                '</div>'+
	                '<div class="modal-footer">'+
	                  '<button type="button" class="btn btn-secondary" data-dismiss="modal">Close</button>'+
	                  '<button type="submit" class="btn btn-primary" data-bind="click: createTournament">Create Tournament</button>'+
	                '</div>'+
                  '</form>'+
              '</div>'+
            '</div>'+
          '</div>',


	populate : function(tournaments) {

	    // Add HTML to the DOM and init the view model
	    var $bindings = utilities.addToDOM('new-tournament', AddTournamentView.html);

	    $('#newTournamentModal').on('shown.bs.modal', function () {
		    $('#tournamentNameInput').focus();
		});

	    $('#newTournamentModal').modal('show');

	    ko.applyBindings( new AddTournamentView.View(tournaments), $bindings );
	},

	View : function(tournaments) {
		// view model
		var self = this;
		self.tournaments = tournaments;
		self.tournamentInput = ko.observable('');



        NOTIFIER.subscribe(function(tournament_id) {
            $('#newTournamentModal').modal('hide');
        }, self, "hideAllExceptDashboard");


		self.createTournament = function() {
			var tournament = self.tournamentInput();
			if(tournament !== "") {
				NOTIFIER.notifySubscribers('', "hideDashboard");
				NOTIFIER.notifySubscribers(tournament, "postNewTournament");
                self.tournamentInput('');
                $('#newTournamentModal').modal('hide');
			}
		};
	}
};