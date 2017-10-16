var PairingsView = {
    pairingHTML: ''+
    '<div class="well well-lg inner-well">'+
        '<div class="pair">'+
            '<div class="list-group player-paired">'+
                '<div class="list-group-item list-group-item-action pointer" data-bind="css: { active : players()[%PLAYER-1-INDEX%].isSelected, disabled : players()[%PLAYER-2-INDEX%].isSelected }, click: reportResult(players()[%PLAYER-1-INDEX%], players()[%PLAYER-2-INDEX%])">%PLAYER-1%</div>'+
            '</div>'+
            '<div class="paired-spacer"></div>'+
            '<div class="list-group player-paired">'+
                '<div class="list-group-item list-group-item-action pointer" data-bind="css: { active : players()[%PLAYER-2-INDEX%].isSelected, disabled : players()[%PLAYER-1-INDEX%].isSelected }, click: reportResult(players()[%PLAYER-2-INDEX%], players()[%PLAYER-1-INDEX%])">%PLAYER-2%</div>'+
            '</div>'+
        '</div>'+
    '</div>',

    rowHTML: ''+
    '<div data-bind="visible: shouldShowView()">'+
        '<div class="row">'+
            '<div class="pairings-header">'+
                '<h4>Round %THIS-ROUND% of %TOTAL-ROUNDS%</h4>'+
                '<i>Click on a player to report winner</i>'+
            '</div>'+
            '<i class="fa fa-info-circle fa-2x pull-right standings-btn" data-toggle="modal" data-target="#myModal" data-bind="click: showStandings"></i>'+
        '</div>'+
        '<div class="row pairs">'+
            '%PAIRS-HTML%'+
        '</div>'+
        '<div class="row" data-bind="visible: buttonState">'+
            '<button type="submit" class="btn btn-primary btn-lg btn-block next-round" data-bind="text: nextRoundBtnText, click: pairUp"></button>'+
        '</div>'+
    '</div>',

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

            var r = [[/%PLAYER-1-INDEX%/g, player1INDEX],
                     [/%PLAYER-2-INDEX%/g, player2INDEX],
                     [/%PLAYER-1%/g, model()[player1INDEX].name()],
                     [/%PLAYER-2%/g, model()[player2INDEX].name()]];

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

            // Put list of pairings in `rowHTML`
            var html = PairingsView.rowHTML.slice();
            var html = html.replace('%THIS-ROUND%', r.progress.this_round)
            var html = html.replace('%TOTAL-ROUNDS%', r.progress.total_rounds)
            var html = html.replace('%PAIRS-HTML%', pairingsHTML);

            // Add HTML to the DOM and init the view model
            var $pairings = document.getElementById('pairings');
            $pairings.innerHTML = ''
            $pairings.innerHTML = '<div id="pairings-bindings"></div>';
            var $bindings = document.getElementById('pairings-bindings');
            $bindings.innerHTML = html;
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
                var data = {'reportResult' : winner.id+","+loser.id+","+shouldReplace+","+shouldClear};
                $.post('/', data, function(returnedData) {
                    var r = JSON.parse(returnedData);

                    console.log(r.progress);
                    self.progress().update(r.progress);


                    // Synchronize local model with server data.
                    winner.wins(r.winner.wins);
                    winner.matches(r.winner.matches);
                    loser.wins(r.loser.wins);
                    loser.matches(r.loser.matches);
                    // console.log(winner.name()+', the winner, has '+winner.wins()+' wins.');
                    // console.log(winner.name()+', the winner, has played '+winner.matches()+' matches.');
                    // console.log(loser.name()+', the loser, has '+loser.wins()+'  wins.');
                    // console.log(loser.name()+', the loser, has played '+loser.matches()+'  matches.');
                });
            }

            self.pairUp = function() {
                var p = [];
                for (var i = 0; i < self.players().length; i++) {
                    var x = self.players()[i];
                    x.isSelected(false);
                    p.push(x.id);
                }
                var data = {roundComplete: JSON.stringify({p})};
                $.post('/', data, function(returnedData) {
                    var r = JSON.parse(returnedData);
                    if(r.this_round > r.total_rounds) {
                        $('#myModal').modal('show');
                        NOTIFIER.notifySubscribers("results", "showStandingsView");
                    } else {
                        $('#myModal').modal('show');
                        NOTIFIER.notifySubscribers("results", "showStandingsView");
                        NOTIFIER.notifySubscribers("pairings", "showPairingsView");
                    }
                });
            }
        }
    }
};