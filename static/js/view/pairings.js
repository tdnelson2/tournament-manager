var PairingsView = {
    pairingHTML: ''+
    '<div class="well well-lg inner-well">'+
        '<div class="pair"">'+
            '<div class="list-group player-paired">'+
                '<a href="#" class="list-group-item list-group-item-action" data-bind="css: { active : players()[%PLAYER-1-INDEX%].isSelected, disabled : players()[%PLAYER-2-INDEX%].isSelected }, click: reportResult(players()[%PLAYER-1-INDEX%], players()[%PLAYER-2-INDEX%])">%PLAYER-1%</a>'+
            '</div>'+
            '<div class="paired-spacer"></div>'+
            '<div class="list-group player-paired">'+
                '<a href="#" class="list-group-item list-group-item-action" data-bind="css: { active : players()[%PLAYER-2-INDEX%].isSelected, disabled : players()[%PLAYER-1-INDEX%].isSelected }, click: reportResult(players()[%PLAYER-2-INDEX%], players()[%PLAYER-1-INDEX%])">%PLAYER-2%</a>'+
            '</div>'+
        '</div>'+
    '</div>',

    rowHTML: ''+
    '<div data-bind="visible: shouldShowView()">'+
        '<div class="row">'+
            '<h4>Matches</h4>'+
            '<i>Click on a player to report winner</i>'+
        '</div>'+
        '<div class="row">'+
            // '<div class="well well-lg">'+
                '%PAIRS-HTML%'+
            // '</div>'+
        '</div>'+
    '</div>',

    populate: function(model) {
        // Add HTML to the DOM and init the view model
        var $pairings = document.getElementById('pairings');

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
                for (var i = 0; i < self.players().length; i++) {
                    var player = self.players()[i];
                    if( player.id === x.id1 ) { player1INDEX = i; }
                    if( player.id === x.id2 ) { player2INDEX = i; }
                    if( player1INDEX !== null && player2INDEX !== null ) { break; }
                };
                pairingsHTML += buildPairing(player1INDEX, player2INDEX);
            };

            // Put list of pairings in `rowHTML`
            var html = PairingsView.rowHTML.slice();
            var html = html.replace('%PAIRS-HTML%', pairingsHTML);
            $pairings.innerHTML = html;
            ko.applyBindings( new PairingsView.View(model), $pairings );
        });
    },

    View: function(model) {
        // KO object
        self = this;
        self.shouldShowView = ko.observable(true);
        self.players = model;

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
                var s = shouldClear ? false : true;
                winner.isSelected(s);
                loser.isSelected(false);
                var data = {'reportResult' : winner.id+","+loser.id+","+shouldReplace+","+shouldClear};
                $.post('/', data, function(returnedData) {
                    var r = JSON.parse(returnedData);

                    // Synchronize local model with server data.
                    winner.wins(r.standings[0].wins);
                    winner.matches(r.standings[0].matches);
                    loser.wins(r.standings[1].wins);
                    loser.matches(r.standings[1].matches);
                    console.log(winner.name()+', the winner, has '+winner.wins()+' wins.');
                    console.log(winner.name()+', the winner, has played '+winner.matches()+' matches.');
                    console.log(loser.name()+', the loser, has '+loser.wins()+'  wins.');
                    console.log(loser.name()+', the loser, has played '+loser.matches()+'  matches.');
                });
            }
        }
    }
};