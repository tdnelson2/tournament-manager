var AddPlayersView = {
    html: ''+
            '<div class="text-center add-players-view" data-bind="visible: shouldShowView">'+
                '<div class="bs-container-fluid-modified bs-container-modified">'+
	                '<div class="content"'+
					    '<div class="row">'+
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


    populate: function(model) {
        // Add HTML to the DOM and init the view model
        var $players = document.getElementById('add-players');
        $players.innerHTML = '';
        $players.innerHTML = '<div id="players-bindings"></div>';
        var $bindings = document.getElementById('players-bindings');
        $bindings.innerHTML = AddPlayersView.html;

        ko.applyBindings( new AddPlayersView.View(model), $bindings );
        $('#addPlayerField').focus();
    },

    View: function(model) {
        self = this;
        self.shouldShowView = ko.observable(true);
        self.players = model;
        self.playerInput = ko.observable("");

		self.shouldShowPlayersAdded = function() {
			if( self.players().length > 0 ) {
				return true;
			};
			return false;
		};

		self.addPlayer = function() {
			var player = self.playerInput();
			if(player != "") {
				var data = { name:player, wins:0, matches:0 };
				self.players.push( new Model.Player(data) );
				var playerObj = self.players()[self.players().length - 1];

				var data = { 'newPlayer': player };
				$.post('/', data, function(returnedData) {
					var playerID = JSON.parse(returnedData);
					playerObj.id = playerID.id;
				});
				self.playerInput("");
			}
		};

		self.pairUp = function() {
			if(self.players().length % 2 === 0) {

				// Hide AddPlayerView
				self.shouldShowView(false);

				// Notify: MainViewModel to show PairingsViewModel
				NOTIFIER.notifySubscribers(RoundStatus.FIRST_ROUND, "showPairingsView");
			} else {
				alert('You must have an even number of players to proceed');
			}
		};
    }
};