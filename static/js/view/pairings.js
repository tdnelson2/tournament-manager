var PairingsView = {
    pairingHTML: ''+
                '<div class="bg-muted clearfix pair-card">'+
                '<div class="list-group float-left player-paired">'+
                  '<a href="javascript:void(0)" class="list-group-item list-group-item-action flex-column align-items-start" '+
                      'data-bind="css: { active : players()[%PLAYER-1-INDEX%].isSelected, disabled : players()[%PLAYER-2-INDEX%].isSelected }, '+
                      'click: reportResult(players()[%PLAYER-1-INDEX%], players()[%PLAYER-2-INDEX%])">'+
                      '<div class="d-flex w-100 justify-content-between">'+
                        '<h6 class="mb-1" data-bind="text: players()[%PLAYER-1-INDEX%].name"></h6>'+
                        '<span class="badge badge-default badge-pill record-badge" '+
                        'data-bind="text: players()[%PLAYER-1-INDEX%].wins()+\' - \'+players()[%PLAYER-1-INDEX%].matches()"></span>'+
                      '</div>'+
                  '</a>'+
                '</div>'+
                '<div class="list-group float-right player-paired">'+
                  '<a href="javascript:void(0)" class="list-group-item list-group-item-action flex-column align-items-start" '+
                      'data-bind="css: { active : players()[%PLAYER-2-INDEX%].isSelected, disabled : players()[%PLAYER-1-INDEX%].isSelected }, '+
                      'click: reportResult(players()[%PLAYER-2-INDEX%], players()[%PLAYER-1-INDEX%])">'+
                      '<div class="d-flex w-100 justify-content-between">'+
                        '<h6 class="mb-1" data-bind="text: players()[%PLAYER-2-INDEX%].name"></h6>'+
                        '<span class="badge badge-default badge-pill record-badge" '+
                        'data-bind="text: players()[%PLAYER-2-INDEX%].wins()+\' - \'+players()[%PLAYER-2-INDEX%].matches()"></span>'+
                      '</div>'+
                  '</a>'+
                '</div>'+
                '</div>'+
                '<div class="pair-separator"></div>',

    rowHTML: ''+
                    '<div class="categories" data-bind="visible: shouldShowView">'+
                        '<div class="bs-container-fluid-modified bs-container-modified">'+
                            '<div class="content">'+
                              '<div class="row justify-content-md-center">'+
                                  '<div class="col col-lg-6">'+
                                        '<div class="text-center">'+
                                            '<h3 style="display:inline;">%TOURNAMENT-NAME%</h3>'+
                                            '%SETTINGS-MENU%'+
                                        '</div>'+
                                        '<div class="sub-header-separator"></div>'+
                                        '<div class="pairings-header">'+
                                            '<h4 style="margin-bottom: 2px;">Round %THIS-ROUND%</h4>'+
                                            '<small>%TOTAL-ROUNDS% or more rounds may be needed to crown a winner</small>'+
                                        '</div>'+
                                      '<div class="round-card">'+
                                      '%PAIRS-HTML%'+
                                      '</div>'+
                                  '</div>'+
                              '</div>'+
                            '</div>'+
                        '</div>'+
                    '</div> <!-- /categories -->',

    populate: function(model, progress, pairingData, completed_matches, tournament, mainView) {

        // NUMBER OF ROUNDS NEEDED TO CROWN A CHAMPION
        // `var rounds = Math.round(Math.log2(self.model().length));`
        // TOTAL MATCHES
        // `var totalMatches = self.model().length * rounds;`

        var r = pairingData;

        // Restore previous state
        var reported_count = 0;
        if(completed_matches !== undefined) {
            for (var i = 0; i < completed_matches.length; i++) {
                var c = completed_matches[i];
                console.log('this completed match: winner: '+c.winner+' loser: '+c.loser);
                for (var x = 0; x < model().length; x++) {
                    var p = model()[x];
                    if(p.id == c.winner) {
                        p.isSelected(true);
                        reported_count += 1;
                    }
                }
            }
        }

        var buildPairing = function(player1INDEX, player2INDEX) {
            // console.log('player1INDEX: '+player1INDEX);
            // console.log('player2INDEX: '+player2INDEX);

            // Returns a pairing html string using `pairingHTML` as a template
            var h = PairingsView.pairingHTML.slice();

            var r = [[/%PLAYER-1-INDEX%/g, player1INDEX],
                     [/%PLAYER-2-INDEX%/g, player2INDEX]];

            for (var i = 0; i < r.length; i++) {
                x = r[i];
                h = h.replace(x[0], x[1]);
            }
            return h;
        };


        /* Build list of pairings by looping through
           the pairings provided by the server, finding
           the index of the coresponding player for each
           pair from the player ko view model, and adding
           it to the the template. */
        var pairingsHTML = '';
        for (var v = 0; v < r.pairings.length; v++) {
            var x = r.pairings[v];
            var player1INDEX = null;
            var player2INDEX = null;
            for (var i = 0; i < model().length; i++) {
                var player = model()[i];
                if( player.id === x.id1 ) { player1INDEX = i; }
                if( player.id === x.id2 ) { player2INDEX = i; }
                if( player1INDEX !== null && player2INDEX !== null ) { break; }
            }
            pairingsHTML += buildPairing(player1INDEX, player2INDEX);
        }

        var dropdown = DropDownMenu.prepare([
        {itemText:' Edit Player Name(s) ...', action:'editPlayers', css:'fa fa-edit fa-fw'}]);

        // Put list of pairings in `rowHTML`
        var html = PairingsView.rowHTML.slice()
                   .replace('%SETTINGS-MENU%', dropdown)
                   .replace('%THIS-ROUND%', r.progress.this_round)
                   .replace('%TOTAL-ROUNDS%', r.progress.total_rounds)
                   .replace('%PAIRS-HTML%', pairingsHTML);
        console.log(r.tournamentName);
        html = html.replace('%TOURNAMENT-NAME%', utilities.sanitize(tournament.name()));

        // Add HTML to the DOM and init the view model
        var $bindings = utilities.addToDOM('pairings', html);


        ko.applyBindings( new PairingsView.View(model, progress, reported_count, mainView), $bindings );
    },

    View: function(model, progress, reported_count, mainView) {
        // KO object
        var self = this;
        self.shouldShowView = ko.observable(true);
        self.players = model;
        self.progress = progress;
        self.mainView = mainView;

        // Number of matches that have been reported.
        self.num = ko.observable(reported_count);

        // Injects css to disable/enable 'Next Round' button
        self.buttonState = ko.pureComputed(function() {
            return self.num() === (self.players().length / 2);
        });

        self.nextRoundBtnText = ko.pureComputed(function() {
            console.log(self.progress().total_rounds());
            console.log(self.progress().this_round());
            return self.progress().total_rounds() == self.progress().this_round() ?
                   'Crown The Champion!' : 'Next Round';
        });

        self.editPlayers = function() {
            if(self.players().length > 0) {
                self.mainView.showEditPlayersModal();
            } else {
                alert('There are no players to edit!\nPlease add players.');
            }
        };

        NOTIFIER.subscribe(function() {
            self.shouldShowView(false);
        }, self, "hideAllExceptDashboard");

        // Update the server each time user chooses a winner
        self.clicks = 0;
        self.reportResult = function(winner, loser) {

            /* Because of a KO bug, when `View` is initiated
               `reportResult` gets called once per player.
               We account for this by ignoring so many
               initial clicks. */
            self.clicks += 1;
            if (self.clicks > self.players().length) {
                var shouldClear = winner.isSelected() ? 1 : 0;
                var shouldReplace = loser.isSelected() ? 1 : 0;

                /* Update number of matches reported and Increment/decrement
                   players in the pair's wins/matches accordingly */
                if(shouldClear) {
                    console.log('CLEAR: view model should clear match results');
                    /* User has deselected a winner: subtract 1 win 1 match
                       played from both the winner and loser. */
                    winner.wins(winner.wins()-1);
                    winner.matches(winner.matches()-1);
                    loser.matches(loser.matches()-1);
                    self.num(self.num() - 1);
                } else if(shouldReplace) {
                    console.log('REPLACE: view model should replace results');
                    /* A winner and loser had already been set but the user
                       has decided to reverse the results. The loser becomes
                       the winner and the winner becomes the loser. */
                    winner.wins(winner.wins()+1);
                    loser.wins(loser.wins()-1);
                } else if(!shouldReplace) {
                    console.log('NEW: view model should add a new results');
                    /* User selects a winner in a match where the winner
                       winner had not yet been selected. */
                    self.num(self.num() + 1);
                    winner.wins(winner.wins()+1);
                    winner.matches(winner.matches()+1);
                    loser.matches(loser.matches()+1);
                }

                winner.isSelected(!shouldClear);
                loser.isSelected(false);

                var data = {
                    winner: winner,
                    loser: loser,
                    shouldReplace: shouldReplace,
                    shouldClear: shouldClear
                };

                self.mainView.postMatchResult(data);

                if(self.num() === (self.players().length / 2)) {
                    console.log('next round prompt should appear');
                    self.mainView.showStandingsView();
                }
            }
            return false;
        };
    }
};