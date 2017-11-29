var ViewModel = {
	View: function(shouldShowToolbar) {

		var self = this;

		self.players = ko.observableArray([]);
		self.playerInput = ko.observable("");
		self.shouldShowPairedPlayers = ko.observable(false);
		self.pairedPlayers = ko.observableArray([]);

		// Sidebar show/hide
		self.toolbarVisible = ko.observable(shouldShowToolbar);
	    self.toggleToolbar = function() {
	        self.toolbarVisible(!self.toolbarVisible());
	    };

		$( window ).resize(function() {
			if($( window ).width() < 768) {
				self.toolbarVisible(false);
			} else {
				self.toolbarVisible(true);
			}
		});

		self.shouldShowPlayersAdded = function() {
			if(self.players().length > 0 && !self.shouldShowPairedPlayers()) {
				return true;
			}
			return false;
		};

		self.addPlayer = function() {
			var player = self.playerInput();
			if(player !== "") {
				var data = { name:player, wins:0, totalPlayed:0 };
				self.players.push( new Model.Player(data) );
				var playerObj = self.players()[self.players().length - 1];

				var newTournament = { 'newPlayer': player };
				$.post('/', newTournament, function(returnedData) {
					var playerID = JSON.parse(returnedData);
					playerObj.id = playerID.id;
				});
				self.playerInput("");
			}
		};

		self.pairUp = function() {
			if(self.players().length % 2 === 0) {
				$.ajax({
					url: '/swiss-pairing/JSON/'
				}).done(function(result) {
					var r = JSON.parse(result);
					// Clear the current parings KO array
					self.pairedPlayers([]);
					r.parings.forEach(function(x) {
						for (var i = 0; i < self.players().length; i++) {
							var player = self.players()[i];
							if(player().id === x.id) {self.pairedPlayers.push(player);}
						}
					});
					self.shouldShowPairedPlayers(true);
				});
			} else {
				// Flash: 'Warning you must have an even number of players'
			}
		};

		self.reportWinner = function(winner) {
			// do stuff
		};

		self.init = function() {
			$.ajax({
				url: '/player-standings/JSON/'
			}).done(function(result) {
				var jresult = JSON.parse(result);
				jresult.standings.forEach(function(player) {
					self.players.push( new Model.Player(player) );
				});
			});
		};

		self.init();
	}
};