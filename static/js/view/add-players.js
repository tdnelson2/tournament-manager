var AddPlayersView = {
    html: ''+
            '<div class="text-center add-players-view" data-bind="visible: shouldShowView">'+
                '<div class="bs-container-fluid-modified bs-container-modified">'+
	                '<div class="content"'+
					    '<div class="row">'+
                        '<h3 style="display:inline;">%TOURNAMENT-NAME%</h3>'+
                        '%SETTINGS-MENU%'+
                        '<div class="pair-separator" style="margin-bottom:15px;"></div>'+
					        '<form class="new-player-input">'+
					            '<div class="form-group">'+
					                '<label for="addPlayerField">Add Players</label>'+
					                '<input type="text" class="form-control" id="addPlayerField" placeholder="" data-bind="value: playerInput">'+
				                '</div>'+
					            '<button type="submit" class="btn btn-primary" data-bind="click: addPlayer">Add</button>'+
					        '</form>'+
					    '</div>'+
					    '<div data-bind="visible: shouldShowPlayersAdded()" class="new-players">'+
					        '<div class="text-center">'+
					            '<h4>Players</h4>'+
					        '</div>'+
					        '<div class="card player-list">'+
					            '<div data-bind="foreach: players" class="list-group list-group-flush w-100 align-items-stretch">'+
					                '<li class="list-group-item text-center d-inline-block" data-bind="text: name"></li>'+
					            '</div>'+
					        '</div>'+
					        '<div class="text-center">'+
					            '<button type="submit" class="btn btn-primary" data-bind="click: pairUp">Pair Up</button>'+
					        '</div>'+
					    '</div>'+
				    '</div>'+
                '</div>',


    populate: function(model, tournament) {
        // Add HTML to the DOM and init the view model

        var dropdown = DropDownMenu.prepare([
            {itemText:' Delete Players(s) ...', action:'deletePlayers', css:'fa fa-trash-o fa-fw'},
            {itemText:' Edit Player Name(s) ...', action:'editPlayers', css:'fa fa-edit fa-fw'}]);

        var html = AddPlayersView.html.slice()
			        .replace('%SETTINGS-MENU%', dropdown)
			        .replace('%TOURNAMENT-NAME%', tournament.name());
        var $bindings = utilities.addToDOM('add-players', html);

        ko.applyBindings( new AddPlayersView.View(model, tournament), $bindings );
        $('#addPlayerField').focus();
    },

    View: function(model, tournament) {
        var self = this;
        self.shouldShowView = ko.observable(true);
        self.players = model;
        self.tournament = tournament;
        self.playerInput = ko.observable("");

		self.shouldShowPlayersAdded = function() {
			if( self.players().length > 0 ) {
				return true;
			}
			return false;
		};

		self.addPlayer = function() {
			var player = self.playerInput();
			if(player !== "") {
				data = {
					name: player,
					wins: 0,
					matches: 0,
					tournament_id: tournament.id
				};
				NOTIFIER.notifySubscribers(data, "postNewPlayer");
				self.playerInput("");
			}
		};

		self.pairUp = function() {
			if(self.players().length % 2 === 0) {

				// Hide AddPlayerView
				self.shouldShowView(false);

                var data = {
                    status: RoundStatus.FIRST_ROUND,
                    tournament: self.tournament
                };
				// Notify: MainViewModel to show PairingsViewModel
				NOTIFIER.notifySubscribers(data, "showPairingsView");
			} else {
				alert('You must have an even number of players to proceed');
			}
		};

		self.deletePlayers = function() {
			if(self.players().length > 0) {
                NOTIFIER.notifySubscribers(self.tournament,'showDeletePlayersModal');
			} else {
				alert('There are no players to delete!\nPlease add players.');
			}
		};

		self.editPlayers = function() {
			if(self.players().length > 0) {
                NOTIFIER.notifySubscribers(self.tournament,'showEditPlayersModal');
			} else {
				alert('There are no players to edit!\nPlease add players.');
			}
		};

        NOTIFIER.subscribe(function(tournament_id) {
            self.shouldShowView(false);
        }, self, "hideAllExceptDashboard");
    }
};