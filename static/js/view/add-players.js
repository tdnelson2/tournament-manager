var AddPlayersView = {
    html: ''+
            '<div class="text-center add-players-view" data-bind="visible: shouldShowView">'+
                '<div class="bs-container-fluid-modified bs-container-modified">'+
	                '<div class="content"'+
					    '<div class="row">'+
                        '<h3 style="display:inline;">%TOURNAMENT-NAME%</h3>'+
                        '%SETTINGS-MENU%'+
                        '<div class="sub-header-separator"></div>'+
					        '<form class="new-player-input">'+
					            '<div class="form-group">'+
					                '<label for="addPlayerField">Add Players</label>'+
					                '<input type="text" class="form-control" id="addPlayerField" placeholder="" data-bind="value: playerInput">'+
				                '</div>'+
					            '<button type="submit" class="btn btn-primary" data-bind="click: addPlayer">Add</button>'+
					            '<button type="submit" style="margin-left:20px" class="btn btn-secondary" data-bind="visible: shouldShowPlayersAdded(), css: { \'not-allowed\' : cannotPair() }, attr: { \'disabled\' : toggleDisabledAttr() }, click: pairUp">Pair Up</button>'+
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
					    '</div>'+
				    '</div>'+
                '</div>',


    populate: function(model, tournament, mainView) {
        // Add HTML to the DOM and init the view model

        var dropdown = DropDownMenu.prepare([
            {itemText:' Delete Players(s) ...', action:'deletePlayers', css:'fa fa-trash-o fa-fw'},
            {itemText:' Edit Player Name(s) ...', action:'editPlayers', css:'fa fa-edit fa-fw'}]);

        var html = AddPlayersView.html.slice()
			        .replace('%SETTINGS-MENU%', dropdown)
			        .replace('%TOURNAMENT-NAME%', tournament.name());
        var $bindings = utilities.addToDOM('add-players', html);

        ko.applyBindings( new AddPlayersView.View(model, mainView), $bindings );
        $('#addPlayerField').focus();
    },

    View: function(model, mainView) {
        var self = this;
        self.shouldShowView = ko.observable(true);
        self.players = model;
        self.playerInput = ko.observable("");
        self.mainView = mainView;

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
					matches: 0
				};
				self.mainView.postNewPlayer(data);
				self.playerInput("");
			}
			$('#addPlayerField').focus();
		};

        self.cannotPair = ko.pureComputed(function() {
            return self.players().length % 2 === 1;
        });

        self.toggleDisabledAttr = ko.pureComputed(function() {
            return self.players().length % 2 === 1 ? 'disabled' : undefined;
        });

		self.pairUp = function() {
			if(self.players().length % 2 === 0) {

				// Hide AddPlayerView
				self.shouldShowView(false);
				self.mainView.showPairingsView(RoundStatus.FIRST_ROUND);
			} else {
				alert('You must have an even number of players to proceed');
			}
		};

		self.deletePlayers = function() {
			if(self.players().length > 0) {
                self.mainView.showDeletePlayersModal();
			} else {
				alert('There are no players to delete!\nPlease add players.');
			}
		};

		self.editPlayers = function() {
			if(self.players().length > 0) {
                self.mainView.showEditPlayersModal();
			} else {
				alert('There are no players to edit!\nPlease add players.');
			}
		};

        NOTIFIER.subscribe(function() {
            self.shouldShowView(false);
        }, self, "hideAllExceptDashboard");
    }
};