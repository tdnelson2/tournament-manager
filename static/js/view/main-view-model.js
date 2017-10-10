var MainViewModel = function() {
    // Primary view model from which all others are initiated
    var self = this;
    self.players = ko.observableArray([]);


	NOTIFIER.subscribe(function() {
		PairingsView.populate(self.players);
	}, self, "showPairingsView");


	NOTIFIER.subscribe(function() {
		StandingsView.populate(self.players);
	}, self, "showStandingsView");

    self.init = function() {
        // Fetch data from server if available
        $.ajax({
            url: '/standings/JSON/'
        }).done(function(result) {
            var r = JSON.parse(result);

            for (var i = 0; i < r.standings.length; i++) {
                self.players.push( new Model.Player(r.standings[i]) );
            }

	        // Determine which view should display.
	        var noMatchesPlayed = true;
	        var previousPlayersPlayed = 0;
	        var roundIsInProgress = false;
	        for (var i = 0; i < self.players().length; i++) {
	        	var played = self.players()[i].matches();
	        	if(played > 0) {noMatchesPlayed = false;}
	        	if(i !== 0 && played !== previousPlayersPlayed) {roundIsInProgress = true; break;}
	        }

	        // If matches are in progress, show `PairingsView`.
	        if(roundIsInProgress) {console.log('round in progress');}

	        // If is first time or 'Pair' button was not pressed, display `AddPlayerView`.
	    	else if(noMatchesPlayed) { AddPlayersView.populate(self.players); }

	        // If maximum rounds have been reached, show `ResultsView`.
        });
    };

    self.init();
};