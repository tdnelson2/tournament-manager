var MainViewModel = function() {
    // Primary view model from which all others are initiated
    var self = this;
    self.players = ko.observableArray([]);

    self.init = function() {
        // Fetch data from server if available
        $.ajax({
            url: '/player-standings/JSON/'
        }).done(function(result) {
            var r = JSON.parse(result);
            r.standings.forEach(function(player) {
                self.players.push( new Model.Player(player) );
            });
        });
        // Determine which view should display.
        // If is first time or 'Pair' button was not pressed, display `AddPlayerView`.
        // If matches are in progress, show `PairingsView`.
        // If maximum rounds have been reached, show `ResultsView`.
    };

    self.init();
};