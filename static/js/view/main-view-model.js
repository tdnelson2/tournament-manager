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

    NOTIFIER.subscribe(function(data) {

        var items = data.serverKey === "deleteTournaments" ?
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
            if(data.serverKey === "deleteTournaments") {
                GuestModel.removeTournaments(deleteIDs);
            } else {
                GuestModel.removePlayers(data.tournament.id, deleteIDs);
            }
        } else {
            var postData = {};
            postData[data.serverKey] = JSON.stringify(deleteIDs);
            $.post('/tournament-manager/', postData, function(returnedData) {;});
        }
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

        var $bindings = LargeModalView.populate(params);
        ko.applyBindings( new LargeModalView.DeleteView(self.tournaments,
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

        LargeModalView.populate(params);
        var $bindings = LargeModalView.populate(params);
        ko.applyBindings( new LargeModalView.EditView(self.tournaments,
                                                       params.modalID,
                                                       'updateTournamentNames'), $bindings );
    }, self, "showEditTournamentsModal");

    NOTIFIER.subscribe(function(tournament) {
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
                                                       tournament), $bindings );
    }, self, "showEditPlayersModal");


    NOTIFIER.subscribe(function(tournament) {
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
                                                         'deletePlayers',
                                                         tournament), $bindings );
    }, self, "showDeletePlayersModal");


    self.showStandingsModal = function(data) {

        // Make a copy of the model.
        var standingsData = ko.observableArray([]);
        self.players().map(function(x) {
          var p = {
              name: x.name(),
              wins: x.wins(),
              loses: x.matches() - x.wins(),
              matches: x.matches()
          };
          standingsData.push(p);
        });
        standingsData.sort(function (left, right) {
          return left.wins == right.wins ? 0 :
                (left.wins > right.wins ? -1 : 1);
        });
        standingsData.sort(function (left, right) {
          return left.matches == right.matches ? 0 :
                (left.matches > right.matches ? -1 : 1);
        });

        var tournamentIsComplete = utilities.overallWinner(self.players);
        var title = tournamentIsComplete === true ? 'Results' : 'Standings'

        var params = {
           titleTxt:      title,
           modalID:      'standingsModal',
           bodyHTML:      OptionsModal.standingsTable,
           closeBtnTxt:  'Close',
           finishBtnTxt: 'Continue',
           domTargetID:  'standings'
        };

        var $bindings = LargeModalView.populate(params);
        ko.applyBindings( new LargeModalView.StandingsView(standingsData,
                                                           params.modalID,
                                                           data,
                                                           tournamentIsComplete), $bindings );
    };


    NOTIFIER.subscribe(function(data) {
        console.log('should show standings view');
        if(data.status === RoundStatus.FIRST_ROUND) {
            self.showPairingsView(data.tournament);
        } else {
            // Reset all players who were marked 'selected'.
            self.players().map(function(x) {x.isSelected(false);});
            if(GUEST_MODE) {
                console.log('WORKING HERE');
                GuestModel.markRoundComplete(data.tournament.id);
                self.showStandingsModal(data);
            } else {
                // Tell the server to mark the round complete.
                $.post('/tournament-manager/', {roundComplete: 'mark_complete'}, function(returnedData) {
                    var r = JSON.parse(returnedData);
                    self.showStandingsModal(data);
                });
            }
        }
    }, self, "showStandingsView");


	NOTIFIER.subscribe(function(data) {
        console.log('show next pairing');
        self.showPairingsView(data.tournament);
	}, self, "showPairingsView");

    NOTIFIER.subscribe(function(tournament) {
        console.log('showNextRoundView tournament id is: '+tournament.id);
        NextRoundView.populate(self.players, self.progress, tournament);
    }, self, "showNextRoundView");

    NOTIFIER.subscribe(function(data) {
        self.players.push( new Model.Player(data) );
        var playerObj = self.players()[self.players().length - 1];

        if(GUEST_MODE) {
            console.log('Player added.\nTODO: resolve player ids.');
            var p = GuestModel.addPlayer(data.name, data.tournament_id);
            playerObj.id = p.id;
        } else {
            var postData = { 'newPlayer': data.name };
            $.post('/tournament-manager/', postData, function(returnedData) {
                var playerID = JSON.parse(returnedData);
                playerObj.id = playerID.id;
            });
        }
    }, self, "postNewPlayer");

    NOTIFIER.subscribe(function(data) {
        var postData = {
            winner_id: data.winner.id,
            loser_id: data.loser.id,
            tournament_id: data.tournament.id,
            shouldReplace: data.shouldReplace,
            shouldClear: data.shouldClear
        };

        if(GUEST_MODE) {
            GuestModel.reportMatch(postData);
        } else {
            $.post('/tournament-manager/', {reportResult:JSON.stringify(postData)}, function(returnedData) {
                var r = JSON.parse(returnedData);

                console.log(r.progress);
                self.progress().update(r.progress);

                // Synchronize local model with server data (if there is a discrepancy, the server data will trump).
                data.winner.wins(r.winner.wins);
                data.winner.matches(r.winner.matches);
                data.loser.wins(r.loser.wins);
                data.loser.matches(r.loser.matches);
            });
        }
    }, self, "postMatchResult");

    NOTIFIER.subscribe(function(data) {
        if(GUEST_MODE) {
            if(data.serverKey === 'updateTournamentNames') {
                GuestModel.editTournamentNames(data.newNames);
            } else {
                GuestModel.editPlayerNames(data.tournament.id, data.newNames);
            }
        } else {
            var postData = {};
            postData[data.serverKey] =  JSON.stringify(data.newNames);
            $.post('/tournament-manager/', postData, function(r) {;});
        }
    }, self, "postItemNamesUpdate");

    NOTIFIER.subscribe(function(tournamentName) {
        var data = { name:tournamentName, id:-1 };
        self.tournaments.unshift( new Model.Tournament(data) );
        var tournamentObj = self.tournaments()[0];

        if(GUEST_MODE) {
            console.log('tournament init\nTODO: resolve tournament id');
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
    }, self, "postNewTournament");

    self.showPairingsView = function(tournament, completed_matches) {

        // Fetch pairings from the server
        if(GUEST_MODE) {
            var standings = GuestModel.standings(tournament.id);
            standings['tournament_name'] = tournament.name();
            var data = {swiss_pairing_requested: JSON.stringify(standings)};
            $.post('/tournament-manager/guest/', data, function(result) {

                var pairingData = JSON.parse(result);
                console.log(pairingData);
                // self.progress().update(r.progress);
                PairingsView.populate(self.players, self.progress, pairingData, completed_matches, tournament);
            });
        } else {
            $.ajax({
                url: '/tournament-manager/swiss-pairing/JSON/'
            }).done(function(result) {
                var pairingData = JSON.parse(result);
                PairingsView.populate(self.players, self.progress, pairingData, completed_matches, tournament);
            });
        }
    };

    self.createTournament = function() {
        AddTournamentView.populate(self.tournaments);
    };

    self.showTournament = function(tournament) {

        var restoreTournamentView = function(r, tournament) {
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

    /*
                var players = GuestModel.getPlayers(tournament.id);
                self.players = ko.observableArray([]);
                for (var i = 0; i < players.length; i++) {
                    self.players.push( new Model.Player(players[i]) );
                };
                AddPlayersView.populate(self.players, tournament);
    */


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
             self.showPairingsView(tournament);
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
                console.log('COMPLETED MATCHES: '+r.completed_matches);
                self.showPairingsView(tournament, r.completed_matches);
            }
        };


        if(GUEST_MODE) {
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
            // var players = GuestModel.getPlayers(tournament.id);
            // self.players = ko.observableArray([]);
            // for (var i = 0; i < players.length; i++) {
            //     self.players.push( new Model.Player(players[i]) );
            // };
            // AddPlayersView.populate(self.players, tournament);
            var data = GuestModel.fullStandings(tournament.id);
            $.post('/tournament-manager/guest/', {progress:JSON.stringify(data.end_of_last_round_standings)}, function(result) {
                var r = JSON.parse(result);
                console.log(r.progress);
                data['progess'] = r.progress;
                restoreTournamentView(data, tournament);
            });
        } else {
            // Fetch data from server if available
            $.ajax({
                url: '/tournament-manager/tournament/'+tournament.id+'/JSON/'
            }).done(function(result) {
                var r = JSON.parse(result);
                console.log(r);
                restoreTournamentView(r, tournament);
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

        var addTournaments = function(data) {
            for (var i = 0; i < data.length; i++) {
                self.tournaments.unshift( new Model.Tournament(data[i]) );
            };
            DashboardView.populate(self.tournaments);
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