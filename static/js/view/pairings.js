var PairingsView = {
    pairingHTML: ''+
                '<div class="bg-muted clearfix pair-card">'+
                '<div class="list-group float-left player-paired">'+
                  '<a href="#" class="list-group-item list-group-item-action flex-column align-items-start" '+
                      'data-bind="css: { active : players()[%PLAYER-1-INDEX%].isSelected, disabled : players()[%PLAYER-2-INDEX%].isSelected }, '+
                      'click: reportResult(players()[%PLAYER-1-INDEX%], players()[%PLAYER-2-INDEX%])">'+
                      '<div class="d-flex w-100 justify-content-between">'+
                        '<h6 class="mb-1" data-bind="text: players()[%PLAYER-1-INDEX%].name"></h6>'+
                        '<span class="badge badge-default badge-pill" '+
                        'data-bind="text: players()[%PLAYER-1-INDEX%].wins()+\' - \'+players()[%PLAYER-1-INDEX%].matches()"></span>'+
                      '</div>'+
                  '</a>'+
                '</div>'+
                '<div class="list-group float-right player-paired">'+
                  '<a href="#" class="list-group-item list-group-item-action flex-column align-items-start" '+
                      'data-bind="css: { active : players()[%PLAYER-2-INDEX%].isSelected, disabled : players()[%PLAYER-1-INDEX%].isSelected }, '+
                      'click: reportResult(players()[%PLAYER-2-INDEX%], players()[%PLAYER-1-INDEX%])">'+
                      '<div class="d-flex w-100 justify-content-between">'+
                        '<h6 class="mb-1" data-bind="text: players()[%PLAYER-2-INDEX%].name"></h6>'+
                        '<span class="badge badge-default badge-pill" '+
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

    populate: function(model, progress, completed_matches) {

        // NUMBER OF ROUNDS NEEDED TO CROWN A CHAMPION
        // `var rounds = Math.round(Math.log2(self.model().length));`
        // TOTAL MATCHES
        // `var totalMatches = self.model().length * rounds;`

        // Restore previous state
        var reported_count = 0;
        if(completed_matches !== undefined) {
            for (var i = 0; i < completed_matches.length; i++) {
                c = completed_matches[i];
                for (var x = 0; x < model().length; x++) {
                    p = model()[x];
                    if(p.id == c.winner) {
                        p.isSelected(true);
                        reported_count += 1;
                    }
                }
            }
        }

        var buildPairing = function(player1INDEX, player2INDEX) {

            // Returns a pairing html string using `pairingHTML` as a template
            var h = PairingsView.pairingHTML.slice();
            var player1name = utilities.sanitize(model()[player1INDEX].name());
            var player2name = utilities.sanitize(model()[player2INDEX].name());

            var r = [[/%PLAYER-1-INDEX%/g, player1INDEX],
                     [/%PLAYER-2-INDEX%/g, player2INDEX]];

            for (var i = 0; i < r.length; i++) {
                x = r[i];
                var h = h.replace(x[0], x[1]);
            };
            return h;
        }

        // Fetch pairings from the server
        $.ajax({
            url: '/swiss-pairing/JSON/'
        }).done(function(result) {
            var r = JSON.parse(result);


            // Build list of pairings.
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
                };
                pairingsHTML += buildPairing(player1INDEX, player2INDEX);
            };

        var dropdown = DropDownMenu.prepare([
            {itemText:' Edit Player Name(s) ...', action:'editPlayers', css:'fa fa-edit fa-fw'}]);

            // Put list of pairings in `rowHTML`
            var html = PairingsView.rowHTML.slice()
                       .replace('%SETTINGS-MENU%', dropdown)
                       .replace('%THIS-ROUND%', r.progress.this_round)
                       .replace('%TOTAL-ROUNDS%', r.progress.total_rounds)
                       .replace('%PAIRS-HTML%', pairingsHTML);
            console.log(r.tournamentName);
            var html = html.replace('%TOURNAMENT-NAME%', utilities.sanitize(r.tournamentName));

            // Add HTML to the DOM and init the view model
            var $bindings = utilities.addToDOM('pairings', html);


            ko.applyBindings( new PairingsView.View(model, progress, reported_count), $bindings );
        });
    },

    View: function(model, progress, reported_count) {
        // KO object
        self = this;
        self.shouldShowView = ko.observable(true);
        self.players = model;
        self.progress = progress;

        // Number of matches that have been reported.
        self.num = ko.observable(reported_count);

        self.showStandings = function() {
            console.log('show standings clicked');
            NOTIFIER.notifySubscribers("results", "showStandingsView");
        }

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
                NOTIFIER.notifySubscribers('','showEditPlayersModal');
            } else {
                alert('There are no players to edit!\nPlease add players.')
            }
        };

        // NOTIFIER.subscribe(function() {
        // }, self, "showDashboard");

        NOTIFIER.subscribe(function(tournament_id) {
            self.shouldShowView(false);
        }, self, "hideAllExceptDashboard");

        // Update the server each time user chooses a winner
        self.clicks = 0;
        self.reportResult = function(winner, loser) {

            // Because of a KO bug, when `View` is initiated
            // `reportResult` gets called once per player.
            // We account for this by ignoring so many
            // initial clicks.
            self.clicks += 1
            if (self.clicks > self.players().length) {
                var shouldClear = winner.isSelected() ? 1 : 0;
                var shouldReplace = loser.isSelected() ? 1 : 0;

                // Update number of matches reported
                if(shouldClear)         { self.num(self.num() - 1); }
                else if(!shouldReplace) { self.num(self.num() + 1); };

                winner.isSelected(!shouldClear);
                loser.isSelected(false);

                // Increment players in the pair's wins/matches accordingly
                winner.wins(winner.wins()+1); winner.matches(winner.matches()+1); loser.matches(loser.matches()+1);

                var data = {'reportResult' : winner.id+","+loser.id+","+shouldReplace+","+shouldClear};
                $.post('/', data, function(returnedData) {
                    var r = JSON.parse(returnedData);

                    console.log(r.progress);
                    self.progress().update(r.progress);

                    // Synchronize local model with server data (if there is a discrepancy, the server data will trump).
                    winner.wins(r.winner.wins); winner.matches(r.winner.matches); loser.wins(r.loser.wins); loser.matches(r.loser.matches);
                });

                if(self.num() === (self.players().length / 2)) {
                    console.log('next round button should appear');
                    NOTIFIER.notifySubscribers("next round", "showNextRoundView");
                }
            }
        }
    }
};