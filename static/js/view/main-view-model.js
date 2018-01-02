var MainViewModel = function() {
    // Primary view model from which all others are initiated
    var self = this;
    self.players = ko.observableArray([]);
    self.progress = ko.observable();
    self.tournaments = ko.observableArray([]);
    self.tournament;
    self.toolbarItems = ko.observableArray([]);

    self.promptForTournamentDelete = function(thisTournament) {
        DeletePrompt.populate(thisTournament, 'deleteTournaments', self);
    };

    self.deleteItems = function(serverKey) {

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
        };
        if(GUEST_MODE) {
            if(serverKey === "deleteTournaments") {
                GuestModel.removeTournaments(deleteIDs);
            } else {
                GuestModel.removePlayers(self.tournament.id, deleteIDs);
            }
        } else {
            var postData = {};
            postData[serverKey] = JSON.stringify(deleteIDs);
            $.post('/tournament-manager/', postData, function(returnedData) {;});
        }
    };

    self.showDeleteTournamentsModal = function() {
        var params = {
           titleTxt:     'Delete Tournament(s)',
           modalID:      'deleteTournaments',
           bodyHTML:      OptionsModal.checkbox,
           closeBtnTxt:  'Cancel',
           finishBtnTxt: 'Delete',
           domTargetID:  'delete-tournaments'
        };

        var $bindings = LargeModalView.populate(params);
        ko.applyBindings( new LargeModalView.DeleteView(self.tournaments,
                                                         params.modalID,
                                                         'deleteTournaments',
                                                         self), $bindings );
    };
    self.showEditTournamentsModal = function() {
        var params = {
           titleTxt:     'Edit Tournament Name(s)',
           modalID:      'editTournaments',
           bodyHTML:      OptionsModal.field,
           closeBtnTxt:  'Cancel',
           finishBtnTxt: 'Update',
           domTargetID:  'edit-tournaments'
        };

        LargeModalView.populate(params);
        var $bindings = LargeModalView.populate(params);
        ko.applyBindings( new LargeModalView.EditView(self.tournaments,
                                                       params.modalID,
                                                       'updateTournamentNames',
                                                       self), $bindings );
    };

    self.showEditPlayersModal = function() {
        var params = {
           titleTxt:     'Edit Player Name(s)',
           modalID:      'editPlayers',
           bodyHTML:      OptionsModal.field,
           closeBtnTxt:  'Cancel',
           finishBtnTxt: 'Update',
           domTargetID:  'edit-players'
        };

        var $bindings = LargeModalView.populate(params);
        ko.applyBindings( new LargeModalView.EditView(self.players,
                                                       params.modalID,
                                                       'updatePlayerNames',
                                                       self), $bindings );
    };

    self.showDeletePlayersModal = function() {
        var params = {
           titleTxt:     'Delete Players',
           modalID:      'deletePlayers',
           bodyHTML:      OptionsModal.checkbox,
           closeBtnTxt:  'Cancel',
           finishBtnTxt: 'Delete',
           domTargetID:  'delete-players'
        };

        var $bindings = LargeModalView.populate(params);
        ko.applyBindings( new LargeModalView.DeleteView(self.players,
                                                         params.modalID,
                                                         params.modalID,
                                                         self), $bindings );
    };

    self.showStandingsModal = function() {

        // Make a copy of the model.
        var roundIsInProgress = false;
        var standingsData = ko.observableArray([]);
        self.players().map(function(x) {
          var p = {
              name: x.name(),
              wins: x.wins(),
              loses: x.matches() - x.wins(),
              matches: x.matches()
          };
          if(x.isSelected()){roundIsInProgress = true;}
          standingsData.push(p);
        });

        // Sort players by number of wins/matches played
        standingsData.sort(function (left, right) {
          return left.wins == right.wins ? 0 :
                (left.wins > right.wins ? -1 : 1);
        });
        standingsData.sort(function (left, right) {
          return left.matches == right.matches ? 0 :
                (left.matches > right.matches ? -1 : 1);
        });

        var champion = utilities.overallWinner(self.players);
        var title = champion === undefined ? 'Standings' 
                                 : "Results: <span class=\"winner-highlight\">Winner Is '"+champion+"'!</span>";
        var continueBtn = 'Next Round';
        if(!roundIsInProgress && champion !== undefined) {
            continueBtn = 'Close';
        } else if(roundIsInProgress && champion !== undefined) {
            continueBtn = 'Exit Tournament';
        }


        var params = {
           titleTxt:      title,
           modalID:      'standingsModal',
           bodyHTML:      OptionsModal.standingsTable,
           closeBtnTxt:  'Go Back',
           finishBtnTxt: continueBtn,
           domTargetID:  'standings'
        };

        var $bindings = LargeModalView.populate(params);

        ko.applyBindings( new LargeModalView.StandingsView(standingsData,
                                                           roundIsInProgress,
                                                           params.modalID,
                                                           champion,
                                                           self), $bindings );
    };

    self.markRoundComplete = function(shouldShowPairings) {
        var proceed = function(shouldShowPairings) {
            if(shouldShowPairings) {
                self.showPairingsView();
            } else {
                NOTIFIER.notifySubscribers('', "hideLoader");
                NOTIFIER.notifySubscribers('', "hideAllExceptDashboard");
            }
        };
        // Reset all players who were marked 'selected'.
        var playedMatchCount = 0;
        self.players().map(function(x) {
            x.isSelected(false);
            playedMatchCount += 1;
        });
        if(playedMatchCount > 0) {
            if(GUEST_MODE) {
                GuestModel.markRoundComplete(self.tournament.id);
                proceed(shouldShowPairings);
            } else {
                // Tell the server to mark the round complete.
                $.post('/tournament-manager/', {roundComplete: 'mark_complete'}, function(returnedData) {
                    var r = JSON.parse(returnedData);
                    proceed(shouldShowPairings);
                });
            }
        } else {
            proceed(shouldShowPairings);
        }
    };


    self.markTournamentComplete = function() {
        NOTIFIER.notifySubscribers('', "hidePairingsView");
        NOTIFIER.notifySubscribers('', "showLoader");
        self.markRoundComplete(false);
    };

	self.showNextViewAfterStandings = function() {
        console.log('show next pairing');
        NOTIFIER.notifySubscribers('', "hidePairingsView");
        NOTIFIER.notifySubscribers('', "showLoader");
        self.markRoundComplete(true);
	};

    self.postNewPlayer = function(data) {
        self.players.unshift( new Model.Player(data) );
        var playerObj = self.players()[0];

        if(GUEST_MODE) {
            var p = GuestModel.addPlayer(data.name, self.tournament.id);
            playerObj.id = p.id;
        } else {
            var postData = { 'newPlayer': data.name };
            $.post('/tournament-manager/', postData, function(returnedData) {
                var playerID = JSON.parse(returnedData);
                playerObj.id = playerID.id;
            });
        }
    };

    self.postMatchResult = function(data) {
        var postData = {
            winner_id: data.winner.id,
            loser_id: data.loser.id,
            tournament_id: self.tournament.id,
            shouldReplace: data.shouldReplace,
            shouldClear: data.shouldClear,
            current_round: self.progress().this_round()
        };

        var hasValidationError = false;
        var shouldShowStandings = data.numberOfMatchesPlayed === (self.players().length / 2);

        if(GUEST_MODE) {
            GuestModel.reportMatch(postData);
            if(shouldShowStandings) {
                self.showStandingsModal();
            }
        } else {
            $.post('/tournament-manager/', {reportResult:JSON.stringify(postData)}, function(returnedData) {
                var r = JSON.parse(returnedData);

                if(r.hasOwnProperty("validation_error")) {
                    hasValidationError = true;
                    alert("Match result failed validation.\n\n"+
                          "It's possible another session\n"+
                          "is also modifying this match.\n\n"+
                          "In order to display the most up-to-date information,\n"+
                          "the tournament will be reloaded.");
                    self.showTournament(self.tournament);
                } else {
                    console.log(r.progress);
                    self.progress().update(r.progress);

                    // Synchronize local model with server data (if there is a discrepancy, the server data will trump).
                    data.winner.wins(r.winner.wins);
                    data.winner.matches(r.winner.matches);
                    data.loser.wins(r.loser.wins);
                    data.loser.matches(r.loser.matches);
                }

                if(shouldShowStandings && !hasValidationError) {
                    self.showStandingsModal();
                }
            });
        }

    };

    self.postItemNamesUpdate = function(data) {
        if(GUEST_MODE) {
            if(data.serverKey === 'updateTournamentNames') {
                GuestModel.editTournamentNames(data.newNames);
            } else {
                GuestModel.editPlayerNames(self.tournament.id, data.newNames);
            }
        } else {
            var postData = {};
            postData[data.serverKey] =  JSON.stringify(data.newNames);
            $.post('/tournament-manager/', postData, function(r) {;});
        }
    };

    self.postNewTournament = function(tournamentName) {
        var data = { name:tournamentName, id:-1 };
        self.tournaments.unshift( new Model.Tournament(data) );
        var tournamentObj = self.tournaments()[0];

        if(GUEST_MODE) {
            var obj = GuestModel.addTournament(tournamentName);
            tournamentObj.id = obj.id;
            console.log('new tournament id: '+self.tournaments()[0].id);
            self.showTournament(tournamentObj);
        } else {
            var data = { 'newTournament': tournamentName };
            $.post('/tournament-manager/', data, function(returnedData) {
                var r = JSON.parse(returnedData);
                tournamentObj.id = r.id;
                self.showTournament(tournamentObj);
            });
        }
    };
    self.showPairingsView = function(completed_matches) {

        // Fetch pairings from the server
        if(GUEST_MODE) {
            var standings = GuestModel.standings(self.tournament.id);
            standings['tournament_name'] = self.tournament.name();
            var data = {swiss_pairing_requested: JSON.stringify(standings)};
            $.post('/tournament-manager/guest/', data, function(result) {

                var pairingData = JSON.parse(result);
                console.log(pairingData);
                self.progress().update(pairingData.progress);
                NOTIFIER.notifySubscribers('', "hideLoader");
                PairingsView.populate(self.players, self.progress, pairingData, completed_matches, self.tournament, self);
            });
        } else {
            $.ajax({
                url: '/tournament-manager/swiss-pairing/JSON/'
            }).done(function(result) {
                var pairingData = JSON.parse(result);
                self.progress().update(pairingData.progress);
                NOTIFIER.notifySubscribers('', "hideLoader");
                PairingsView.populate(self.players, self.progress, pairingData, completed_matches, self.tournament, self);
            });
        }
    };

    self.createTournament = function() {
        AddTournamentView.populate(self);
    };

    self.showTournament = function(tournament) {

        self.tournament = tournament;

        var restoreTournamentView = function(r) {
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
                console.log(r.standings[i]);
                if(r.standings[i].matches > 0) { matchesPlayed = true; }
                self.players.push( new Model.Player(r.standings[i]) );
            }

            // Determine which view should display.

            // If tournament is complete, show results
            if(utilities.overallWinner(self.players) !== undefined && !roundIsInProgress) {
                console.log('show results');
                self.showStandingsModal();
            }
            // If standings is empty, start new session
            // i.e. show `AddPlayersView`.
            else if(r.standings.length === 0) {
             console.log('should start new session');
             AddPlayersView.populate(self.players, self.tournament, self);
            }

            // If a round is not in progress, but matches have been played,
            // start new round by showing the `PairingsView`.
            else if(!roundIsInProgress && matchesPlayed) {
             console.log('matches previously played but this is a new round');
             self.showPairingsView();
            }


            // If no matches have been played, but players have been
            // added, show the `AddPlayerView`.
            else if(!roundIsInProgress && !matchesPlayed) {
             console.log('no matches have been played yet, user can safely add more players');
             AddPlayersView.populate(self.players, self.tournament, self);
            }

            // If matches have been played, but user has not advanced
            // to the next round or some results remain to be reported,
            // show `PairingsView` and include results from previously
            // reported matches.
            else if(roundIsInProgress) {
             console.log('restore uncompleted round');
                console.log('COMPLETED MATCHES: '+r.completed_matches);
                self.showPairingsView(r.completed_matches, self);
            }
        };


        if(GUEST_MODE) {
            var data = GuestModel.fullStandings(self.tournament.id);
            $.post('/tournament-manager/guest/', {progress:JSON.stringify(data.end_of_last_round_standings)}, function(result) {
                var r = JSON.parse(result);
                data['progess'] = r.progress;
                restoreTournamentView(data);
            });
        } else {
            // Fetch data from server if available
            $.ajax({
                url: '/tournament-manager/tournament/'+self.tournament.id+'/JSON/'
            }).done(function(result) {
                var r = JSON.parse(result);
                console.log(r);
                restoreTournamentView(r);
            });
        }
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

        ko.applyBindings(new HeaderView.View(), document.getElementById('header'));
        ko.applyBindings( new LoadingView.View(),  document.getElementsByClassName('sk-fading-circle')[0]);

        var addTournaments = function(data) {
            for (var i = 0; i < data.length; i++) {
                self.tournaments.unshift( new Model.Tournament(data[i]) );
            };
            DashboardView.populate(self.tournaments, self);
        }

        if(GUEST_MODE) {
            console.log('get tournaments from local storage');
            console.log(GuestModel.getTournaments());
            addTournaments(GuestModel.getTournaments());
        } else {
            // Fetch tournaments from the server
            $.ajax({
                url: '/tournament-manager/tournaments/JSON/'
            }).done(function(result) {
                addTournaments(JSON.parse(result).tournaments);
            });
        }
    };

    self.init();
};