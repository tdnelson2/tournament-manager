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
            url: '/current-state/JSON/'
        }).done(function(result) {
            var r = JSON.parse(result);
            console.log(r.standings.length);

            // Collect data on current state.
            var roundIsInProgress = false;
            for (var i = 0; i < r.pairings.length; i++) {
            	var x = r.pairings[i];
            	if (x[2] === true) { roundIsInProgress = true; break; }
            }


            // Load data from server into local model.
            var matchesPlayed = false;
            for (var i = 0; i < r.standings.length; i++) {
            	// [dict(id=a, name=b, wins=int(c), matches=int(d), user_id=e)
            	// console.log(r.standings[i].matches);
            	if(r.standings[i].matches > 0) { matchesPlayed = true; }
                self.players.push( new Model.Player(r.standings[i]) );
            }

	        // Determine which view should display.

	        // If standings is empty, start new session
	        // i.e. show `AddPlayersView`.
	        if(r.standings.length === 0) {
	        	console.log('should start new session');
	        	AddPlayersView.populate(self.players);
	        }

	        // If pairings is empty, but matches have been played,
	        // start new round by showing the `PairingsView`.
	        else if(!roundIsInProgress && matchesPlayed) {
	        	console.log('matches previously played but this is a new round');
	        	PairingsView.populate(self.players);
	        }


	        // If no matches have been played, but players have been
	        // added, show the `AddPlayerView`.
	        else if(!roundIsInProgress && !matchesPlayed) {
	        	console.log('no matches have been played yet, user can safely add more players');
	        	AddPlayersView.populate(self.players);
	        }

	        // If matches have been played, but user has not advanced
	        // to the next round or some results remain to be reported,
	        // show `PairingsView` and include results from previously 
	        // reported matches.
	        else if(roundIsInProgress) {
	        	console.log('restore uncompleted round');
	        }

	        // TODO: determine maximun number of rounds and display view accordingly




	     //    var noMatchesPlayed = true;
	     //    var previousPlayersPlayed = 0;
	     //    var roundIsInProgress = false;
	     //    for (var i = 0; i < self.players().length; i++) {
	     //    	var played = self.players()[i].matches();
	     //    	if(played > 0) {noMatchesPlayed = false;}
	     //    	if(i !== 0 && played !== previousPlayersPlayed) {roundIsInProgress = true; break;}
	     //    }

	     //    // If matches are in progress, show `PairingsView`.
	     //    if(roundIsInProgress) {console.log('round in progress');}

	     //    // If is first time or 'Pair' button was not pressed, display `AddPlayerView`.
	    	// else if(noMatchesPlayed) { AddPlayersView.populate(self.players); }

	     //    // If maximum rounds have been reached, show `ResultsView`.
        });
    };

    self.init();
};