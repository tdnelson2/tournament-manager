var AddPlayersView = {
    html: ''+
    '<div data-bind="visible: shouldShowView()">'+
	    '<div class="row">'+
	        '<form>'+
	            '<div class="form-group">'+
	                '<label for="title">Add Players</label>'+
	                '<input type="text" class="form-control" id="title" placeholder="" data-bind="value: playerInput">'+
	                '</div>'+
	            '<button type="submit" class="btn btn-primary" data-bind="click: addPlayer">Add</button>'+
	        '</form>'+
	    '</div>'+
	    '<div data-bind="visible: shouldShowPlayersAdded()">'+
	        '<div class="row">'+
	            '<h4>Players</h4>'+
	        '</div>'+
	        '<div class="row">'+
	            '<div class="well well-lg" data-bind="foreach: players">'+
	                '<div class="list-group">'+
	                    '<a href="" class="list-group-item list-group-item-action category-items" data-bind="text: name"></a>'+
	                '</div>'+
	            '</div>'+
	        '</div>'+
	        '<div class="row">'+
	            '<button type="submit" class="btn btn-primary" data-bind="click: pairUp">Pair Up</button>'+
	        '</div>'+
	    '</div>'+
    '</div>',

    populate: function(model) {
        // Add HTML to the DOM and init the view model
        var $players = document.getElementById('add-players');
        $players.innerHTML = AddPlayersView.html;
        ko.applyBindings( new AddPlayersView.View(model), $players );
    },

    View: function(model) {
        // KO object
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
				var data = { name:player, wins:0, totalPlayed:0 };
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
				NOTIFIER.notifySubscribers("pairings", "showPairingsView");
			} else {
				// Flash: 'You must have an even number of players to proceed'
			}
		};
    }
};