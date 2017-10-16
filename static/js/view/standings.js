var StandingsView = {
    rowHTML: ''+
             '<tr>'+
               '<td>%PLAYER%</td>'+
               '<td>%WINS%</td>'+
               '<td>%LOSES%</td>'+
               '<td>%MATCHES%</td>'+
             '</tr>',
    tableHTML: ''+
          '<table class="table">'+
            '<thead>'+
              '<tr>'+
                '<th>Player</th>'+
                '<th>Wins</th>'+
                '<th>Loses</th>'+
                '<th>Matches</th>'+
              '</tr>'+
            '</thead>'+
            '<tbody>'+
               '%ROWS%'+
            '</tbody>'+
          '</table>',

    populate: function(model, progress) {
        // Add HTML to the DOM and init view
        var buildRow = function(player) {

            // Returns a row using `rowHTML` as template.
            var h = StandingsView.rowHTML.slice();

            var r = [[/%PLAYER%/g, player.name],
                     [/%WINS%/g, player.wins],
                     [/%LOSES%/g, player.loses],
                     [/%MATCHES%/g, player.matches]];

            for (var i = 0; i < r.length; i++) {
                x = r[i];
                var h = h.replace(x[0], x[1]);
            };
            return h;
        }

        // Make a copy of the model.
        var players = [];
        model().map(function(x) {
            var p = {
                name: x.name(),
                wins: x.wins(),
                loses: x.matches() - x.wins(),
                matches: x.matches()
            };
            players.push(p);
        });

        // Sort the players by wins/matches played.
        var s = ['wins', 'matches'];
        s.forEach(function(x) {
            players.sort(function (left, right) {
                return left[x] == right[x] ? 0 :
                      (left[x] > right[x] ? -1 : 1)
            });
        })

        // Build all rows in the table.
        var rowsHTML = '';
        for (var i = 0; i < players.length; i++) {
            rowsHTML += buildRow(players[i]);
        }

        // Insert into DOM
        var $standings = document.getElementById('standings');
        $standings.innerHTML = ''
        $standings.innerHTML = '<div id="standings-bindings"></div>';
        var $bindings = document.getElementById('standings-bindings');
        // var header = progress().match_count() == progress().total_matches() ? 'Standings' : 'Results';
        var tableHTML = StandingsView.tableHTML.slice().replace('%ROWS%', rowsHTML);
        // var tableHTML = tableHTML.replace('%HEADER%', header);
        $bindings.innerHTML = tableHTML;

        // Init binding
        ko.applyBindings( new StandingsView.View(), $bindings );
    },

    View: function() {
        this.exit = function() {
            console.log('play again clicked');
        }
    }
}