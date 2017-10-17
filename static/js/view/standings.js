var StandingsView = {
    tableHTML: ''+
      '<!-- Modal -->'+
      '<div class="modal fade" id="myModal" role="dialog">'+
        '<div class="modal-dialog">'+
          '<!-- Modal content-->'+
          '<div class="modal-content">'+
            '<div class="modal-header">'+
              '<button type="button" class="close" data-dismiss="modal">&times;</button>'+
              '<!-- <h4 class="modal-title"></h4> -->'+
              '<h4 class="modal-title" data-bind="text: progress().this_round() > progress().total_rounds() ? \'Results\' : \'Standings\'"></h4>'+
            '</div>'+
            '<div class="modal-body">'+
              '<table class="table">'+
                '<thead>'+
                  '<tr>'+
                    '<th>Player</th>'+
                    '<th>Wins</th>'+
                    '<th>Loses</th>'+
                    '<th>Matches</th>'+
                  '</tr>'+
                '</thead>'+
                '<tbody data-bind="foreach: players">'+
                   '<tr>'+
                     '<td data-bind="text: name"></td>'+
                     '<td data-bind="text: wins"></td>'+
                     '<td data-bind="text: loses"></td>'+
                     '<td data-bind="text: matches"></td>'+
                   '</tr>'+
                '</tbody>'+
              '</table>'+
            '</div>'+
            '<div class="modal-footer">'+
              '<button type="button" class="btn btn-default" data-dismiss="modal">Close</button>'+
              // '<button type="button" class="btn btn-default" data-dismiss="modal" data-bind="click: standingsModalClose">Close</button>'+
            '</div>'+
          '</div>'+
        '</div>'+
      '</div>',

    populate: function(model, progress) {

        // Make a copy of the model.
        var players = ko.observableArray([]);
        model().map(function(x) {
            var p = {
                name: x.name(),
                wins: x.wins(),
                loses: x.matches() - x.wins(),
                matches: x.matches()
            };
            players().push(p);
        });

        // Sort the players by wins/matches played.
        var s = ['wins', 'matches'];
        s.forEach(function(x) {
            players.sort(function (left, right) {
                return left[x] == right[x] ? 0 :
                      (left[x] > right[x] ? -1 : 1)
            });
        })

        // Insert into DOM
        var $standings = document.getElementById('standings');
        $standings.innerHTML = ''
        $standings.innerHTML = '<div id="standings-bindings"></div>';
        var $bindings = document.getElementById('standings-bindings');
        var tableHTML = StandingsView.tableHTML.slice();
        $bindings.innerHTML = tableHTML;

        $('#myModal').modal('show');

        // Init binding
        ko.applyBindings( new StandingsView.View(players, progress), $bindings );
    },

    View: function(players, progress) {
      var self = this;
      self.players = players;
      self.progress = progress;

      self.standingsModalClose = function() {
        console.log('close button clicked');
      };

      
      $.ajax({
        url: '/progress/JSON/'
      }).done(function(result) {
        var r = JSON.parse(result);
        self.progress().update(r.progress);
      });
    }
}