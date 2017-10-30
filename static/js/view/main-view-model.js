
var MainViewModel = function() {
    // Primary view model from which all others are initiated
    var self = this;
    self.players = ko.observableArray([]);
    self.progress = ko.observable();
    self.tournaments = ko.observableArray([new Model.Tournament({id:0, name:"Create New Tournament"})]);

    NOTIFIER.subscribe(function() {
        console.log('create a tournament');
        self.createTournament();
    }, self, "createTournament");

    NOTIFIER.subscribe(function(tournament_id) {
        console.log('open a tournament');
        self.showTournament(tournament_id);
    }, self, "showTournament");

	NOTIFIER.subscribe(function(status) {
        if(status === RoundStatus.FIRST_ROUND) {
            PairingsView.populate(self.players, self.progress);
        } else {
            self.players().map(function(x) {x.isSelected(false);});
            $.post('/', {roundComplete: 'mark_complete'}, function(returnedData) {
                var r = JSON.parse(returnedData);
                if(r.this_round > r.total_rounds) {
                    StandingsView.populate(self.players, self.progress);
                } else {
                    StandingsView.populate(self.players, self.progress);
                    PairingsView.populate(self.players, self.progress);
                }
            });
        }
	}, self, "showPairingsView");

    NOTIFIER.subscribe(function() {
        console.log('next round view messge recieved');
        NextRoundView.populate(self.players, self.progress);
    }, self, "showNextRoundView");


	NOTIFIER.subscribe(function() {
        console.log('show standings view');
		StandingsView.populate(self.players, self.progress);
	}, self, "showStandingsView");

    self.createTournament = function() {
        AddTournamentView.populate(self.tournaments);
    }

    self.showTournament = function(tournament_id) {
        // Fetch data from server if available
        $.ajax({
            url: '/tournament/'+tournament_id+'/JSON/'
        }).done(function(result) {
            var r = JSON.parse(result);

            // `r.standings` shows each player's win/loss record
            // including matches from if a round is not yet concluded.
            // `r.completed_matches` contains completed matches from
            // the current round if one is in progress.
            // `r.progress` contains:
                // `total_matches`: number of matches to crown a champion.
                // `match_count`: current number of matches played.
                // `player_count`: total number of players.
                // `total_rounds`: number of rounds needed to crown a champion.
                // `this_round`: current round being played.

            self.progress( new Model.Progress(r.progress) );

            // We know a round is in progress if completed_matches is not empty
            var roundIsInProgress = r.completed_matches.length > 0;

            // Load data from server into local model.
            var matchesPlayed = false;
            self.players = ko.observableArray([]);
            for (var i = 0; i < r.standings.length; i++) {
             // [dict(id=a, name=b, wins=int(c), matches=int(d), user_id=e)
             // console.log(r.standings[i].matches);
             if(r.standings[i].matches > 0) { matchesPlayed = true; }
                self.progress().update(r.progress);
                self.players.push( new Model.Player(r.standings[i]) );
            }

            // Determine which view should display.

            // If tournament is complete, show results
            if(r.progress.this_round > r.progress.total_rounds) {
                console.log('show results');
                StandingsView.populate(self.players, self.progress);
            }
            // If standings is empty, start new session
            // i.e. show `AddPlayersView`.
            else if(r.standings.length === 0) {
             console.log('should start new session');
             AddPlayersView.populate(self.players);
            }

            // If a round is not in progress, but matches have been played,
            // start new round by showing the `PairingsView`.
            else if(!roundIsInProgress && matchesPlayed) {
             console.log('matches previously played but this is a new round');
             PairingsView.populate(self.players, self.progress);
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
                PairingsView.populate(self.players, self.progress, r.completed_matches);
            }
        });
    }

    self.init = function() {
        // Fetch tournaments from the server
        $.ajax({
            url: '/tournaments/JSON/'
        }).done(function(result) {
            var data = JSON.parse(result).tournaments;
            for (var i = 0; i < data.length; i++) {
                self.tournaments.unshift( new Model.Tournament(data[i]) );
            }

            DashboardView.populate(self.tournaments);
        });
    };

    self.init();
};