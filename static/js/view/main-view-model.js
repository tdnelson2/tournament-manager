
var MainViewModel = function() {
    // Primary view model from which all others are initiated
    var self = this;
    self.players = ko.observableArray([]);
    self.progress = ko.observable();
    self.tournaments = ko.observableArray([]);
    self.toolbarItems = ko.observableArray([]);

    NOTIFIER.subscribe(function() {
        console.log('create a tournament');
        self.createTournament();
    }, self, "createTournament");

    NOTIFIER.subscribe(function(tournament) {
        console.log('open a tournament');
        self.showTournament(tournament);
    }, self, "showTournament");

    NOTIFIER.subscribe(function(thisTournament) {
        DeletePrompt.populate(thisTournament, 'deleteTournaments');
    }, self, "promptForTournamentDelete");

    NOTIFIER.subscribe(function(serverKey) {

        var items = serverKey === "deleteTournaments" ?
                    self.tournaments : self.players;

        var deleteIDs = [];

        // Loop through tournaments backwards removing as we go.
        for (var i = items().length - 1; i >= 0; --i) {
            var t = items()[i]
            if(t.isSlatedToDelete()) {
                deleteIDs.push(t.id);
                items.splice(i,1);
            }
        }
        var data = {};
        data[serverKey] = JSON.stringify(deleteIDs);
        $.post('/', data, function(returnedData) {;});
    }, self, "deleteItems");


    NOTIFIER.subscribe(function() {
        var params = {
           titleTxt:     'Delete Tournament(s)',
           modalID:      'deleteTournaments',
           bodyHTML:      OptionsModal.checkbox,
           closeBtnTxt:  'Cancel',
           finishBtnTxt: 'Delete',
           domTargetID:  'delete-tournaments'
        };

        var $bindings = ModifyItemsView.populate(params);
        ko.applyBindings( new ModifyItemsView.DeleteView(self.tournaments,
                                                         params.modalID,
                                                         'deleteTournaments'), $bindings );
    }, self, "showDeleteTournamentsModal");

    NOTIFIER.subscribe(function() {
        var params = {
           titleTxt:     'Edit Tournament Name(s)',
           modalID:      'editTournaments',
           bodyHTML:      OptionsModal.field,
           closeBtnTxt:  'Cancel',
           finishBtnTxt: 'Update',
           domTargetID:  'edit-tournaments'
        };

        ModifyItemsView.populate(params);
        var $bindings = ModifyItemsView.populate(params);
        ko.applyBindings( new ModifyItemsView.EditView(self.tournaments,
                                                       params.modalID,
                                                       'updateTournamentNames'), $bindings );
    }, self, "showEditTournamentsModal");

    NOTIFIER.subscribe(function() {
        var params = {
           titleTxt:     'Edit Player Name(s)',
           modalID:      'editPlayers',
           bodyHTML:      OptionsModal.field,
           closeBtnTxt:  'Cancel',
           finishBtnTxt: 'Update',
           domTargetID:  'edit-players'
        };

        var $bindings = ModifyItemsView.populate(params);
        ko.applyBindings( new ModifyItemsView.EditView(self.players,
                                                       params.modalID,
                                                       'updatePlayerNames'), $bindings );
    }, self, "showEditPlayersModal");


    NOTIFIER.subscribe(function() {
        var params = {
           titleTxt:     'Delete Players',
           modalID:      'deletePlayers',
           bodyHTML:      OptionsModal.checkbox,
           closeBtnTxt:  'Cancel',
           finishBtnTxt: 'Delete',
           domTargetID:  'delete-players'
        };

        var $bindings = ModifyItemsView.populate(params);
        ko.applyBindings( new ModifyItemsView.DeleteView(self.players,
                                                         params.modalID,
                                                         'deletePlayers'), $bindings );
    }, self, "showDeletePlayersModal");


	NOTIFIER.subscribe(function(status) {
        if(status === RoundStatus.FIRST_ROUND) {
            PairingsView.populate(self.players, self.progress);
        } else {

            // Reset all players who were marked 'selected'.
            self.players().map(function(x) {x.isSelected(false);});

            // Tell the server to mark the round complete.
            $.post('/', {roundComplete: 'mark_complete'}, function(returnedData) {
                var r = JSON.parse(returnedData);
                console.log(utilities.overallWinner(self.players));
                if(utilities.overallWinner(self.players) !== undefined) {
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

    self.showTournament = function(tournament) {
        // Fetch data from server if available
        $.ajax({
            url: '/tournament/'+tournament.id+'/JSON/'
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
             if(r.standings[i].matches > 0) { matchesPlayed = true; }
                self.progress().update(r.progress);
                self.players.push( new Model.Player(r.standings[i]) );
            }

            // Determine which view should display.

            // If tournament is complete, show results
            if(utilities.overallWinner(self.players) !== undefined && !roundIsInProgress) {
                console.log('show results');
                StandingsView.populate(self.players, self.progress);
            }
            // If standings is empty, start new session
            // i.e. show `AddPlayersView`.
            else if(r.standings.length === 0) {
             console.log('should start new session');
             AddPlayersView.populate(self.players, tournament);
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
             AddPlayersView.populate(self.players, tournament);
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
    };


    // TOOLBAR ITEMS

    self.toolbarAdd = function() {
        self.createTournament()
    };

    self.toolbarSettings = function() {
        alert('The settings option is still under construction');
    };

    self.toolbarDashboard = function() {
        NOTIFIER.notifySubscribers('', "hideAllExceptDashboard");
    };

    self.toolbarStandings = function() {
        alert('The standings option is still under construction');
    };

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