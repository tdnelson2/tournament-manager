var ViewModel = {
	View: function() {

		// WebSocket for event based communication with server
		var socket = io.connect('http://' + document.domain + ':' + location.port);

		var self = this;

		self.players = ko.observableArray([]);
		self.playerInput = ko.observable("");
		self.shouldShowPairedPlayers = ko.observable(false);

		self.shouldShowPlayersAdded = function() {
			if(self.players().length > 0 && !self.shouldShowPairedPlayers()) {
				return true;
			};
			return false;
		};

		self.addPlayer = function() {
			var player = self.playerInput();
			if(player != "") {
				var data = { name:player, wins:0, totalPlayed:0 };
				self.players.push( new Model.Player(data) );
				self.playerInput("");
			}
		};

		self.pairUp = function() {
			if(self.players().length % 2 === 0) {
				players = self.players().map(function(p) { return p.name(); });
				socket.emit('new players', { data: players } );
			} else {
				// Flash: 'Warning you must have an even number of players'
			}
		}

		socket.on('new players', function(data) {
			console.log(data);
		});
	}
}