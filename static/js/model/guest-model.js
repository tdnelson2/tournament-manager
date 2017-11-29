var GuestModel = {

    getModel : function() {
        var tournaments = { nextID:1 };
        try {
            tournaments = JSON.parse(localStorage.tournaments);
        } catch(e) {}
        return tournaments;
    },

    addTournament : function(name) {

        // Get model from localStorage.
        var tournaments = GuestModel.getModel();

        // Add new tournament.
        tournaments[tournaments.nextID] = GuestModel.newTournament(name);

        // Make another tournament obj and add id.
        var tournament = GuestModel.newTournament(name);
        tournament.id = tournaments.nextID;

        // Incriment the nextID property.
        tournaments.nextID += 1;

        // Push model back to localStorage.
        localStorage.tournaments = JSON.stringify(tournaments);
        return tournament;
    },

    newTournament: function(name) {
        return {
            name: name,
            players: {nextID: 1},
            matches: []
        };
    },

    removeTournaments: function(ids) {
        var tournaments = GuestModel.getModel();
        GuestModel.removeItems(tournaments, ids);
        localStorage.tournaments = JSON.stringify(tournaments);
    },

    newPlayer: function(name) {
        return {
            name: name,
            wins: 0,
            matches: 0
        };
    },

    getTournaments: function() {
        var model = GuestModel.getModel();
        return GuestModel.getItems(model);
    },

    addPlayer : function(name, tournament_id) {
        tournament_id = String(tournament_id);
        var model = GuestModel.getModel();
        var players = model[tournament_id].players;
        players[players.nextID] = GuestModel.newPlayer(name);
        var player = GuestModel.newPlayer(name);
        player.id = players.nextID;
        players.nextID += 1;
        localStorage.tournaments = JSON.stringify(model);
        return player;
    },

    getPlayers : function(tournament_id) {
        return GuestModel.getItems(GuestModel.getModel()[String(tournament_id)].players);
    },

    removePlayers : function(tournament_id, ids) {
        var model = GuestModel.getModel();
        GuestModel.removeItems(model[tournament_id].players, ids);
        localStorage.tournaments = JSON.stringify(model);
    },

    editPlayerNames : function(tournament_id, editedPlayers) {
        console.log('tournament_id of players to update: '+tournament_id);
        tournament_id = String(tournament_id);
        var model = GuestModel.getModel();
        var players = model[String(tournament_id)].players;
        GuestModel.editItemNames(players, editedPlayers);
        localStorage.tournaments = JSON.stringify(model);
    },

    editTournamentNames : function(editedTournaments) {
        var model = GuestModel.getModel();
        GuestModel.editItemNames(model, editedTournaments);
        localStorage.tournaments = JSON.stringify(model);
    },

    getItems : function(model) {
        var items = [];
        var keys = Object.keys(model);
        for (var i = 0; i < keys.length; i++) {
            if(keys[i] !== 'nextID') {
                var o = model[keys[i]];
                o.id = parseInt(keys[i]);
                items.push(o);
            }
        }
        return items;
    },

    editItemNames : function(model, items) {
        console.log(items);
        for (var i = 0; i < items.length; i++) {
            model[String(items[i][0])].name = items[i][1];
        }
    },

    removeItems : function(model, ids) {
        GuestModel.keyify(ids);
        for (var i = 0; i < ids.length; i++) {
            console.log(ids[i]);
            delete model[ids[i]];
        }
    },

    standings: function(tournament_id) {
        tournament_id = String(tournament_id);
        var tournament = GuestModel.getModel()[tournament_id];
        var players = tournament.players;
        delete players.nextID;
        var playerKeys = Object.keys(tournament.players);
        var standings = [];
        for (var i = 0; i < playerKeys.length; i++) {
            var k = playerKeys[i];
            var p = players[k];
            standings.push([parseInt(k), p.name, p.wins, p.matches, parseInt(tournament_id), false]);
            // console.log([parseInt(k), p.name, p.wins, p.matches, parseInt(tournament_id), false]);
        }

        standings.sort(function (left, right) {
          return left[2] == right[2] ? 0 :
                (left[2] > right[2] ? -1 : 1);
        });
        standings.sort(function (left, right) {
          return left[3] == right[3] ? 0 :
                (left[3] > right[3] ? -1 : 1);
        });

        return {
            standings:standings,
            matches:tournament.matches
        };
    },

    fullStandings: function(tournament_id) {
        var update = function(s, id, isWinner) {
            for (var i = 0; i < s.length; i++) {
                var x = s[i];
                if(x.id === id) {
                    if(isWinner) {
                        x.wins += 1;
                    }
                    x.matches += 1;
                }
            }
        };

        var s = GuestModel.standings(tournament_id);
        var fullStandings = [];

        for (var i = 0; i < s.standings.length; i++) {
            var x = s.standings[i];
            // parseInt(k), p.name, p.wins, p.matches, parseInt(tournament_id), false
            var player = {
                id:         x[0],
                name:       x[1],
                wins:       x[2],
                matches:    x[3],
                tournament: x[4]
            };
            fullStandings.push(player);
        }

        var completed_matches = [];
        for (var i = 0; i < s.matches.length; i++) {
            var m = s.matches[i];
            if(!m.round_is_complete) {
                update(fullStandings, m.winner, true);
                update(fullStandings, m.loser, false);
                completed_matches.push({
                    winner:m.winner,
                    loser:m.loser
                });
            }
        }
        return {
            standings: fullStandings,
            completed_matches:completed_matches,
            end_of_last_round_standings: s
        };
    },
  
  
    reportMatch: function(data) {
        data.tournament_id = String(data.tournament_id);
        var model = GuestModel.getModel();
        var matches = model[data.tournament_id].matches;
        if(data.shouldClear || data.shouldReplace) {
            /* Iterate backwards to remove the
            match that should be cleared or update
            the matches that should be updated */
            for (var i = matches.length - 1; i >= 0; --i) {
                var m = matches[i];
                if(!m.round_is_complete) {
                    var hit = false;
                    if     (data.winner_id ===  m.winner && data.loser_id  ===  m.loser)  { hit = true; }
                    else if(data.winner_id ===  m.loser  && data.loser_id  ===  m.winner) { hit = true; }
                    if(hit) {
                        if(data.shouldClear) {
                            console.log('match will be cleared: winner:'+m.winner+' loser: '+m.loser);
                          matches.splice(i,1);
                        } else if(data.shouldReplace) {
                            console.log('before match is updated: winner:'+m.winner+' loser: '+m.loser);
                            m.winner = data.winner_id;
                            m.loser  = data.loser_id;
                            console.log('after match is updated: winner:'+m.winner+' loser: '+m.loser);
                        }
                        break;
                    }
                }
            }
        } else {
            matches.push({
                winner: data.winner_id,
                loser: data.loser_id,
                round_is_complete: false
            });
        }
        localStorage.tournaments = JSON.stringify(model);
    },

    markRoundComplete: function(tournament_id) {
        tournament_id = String(tournament_id);
        var model = GuestModel.getModel();
        var players = model[tournament_id].players;
        var matches = model[tournament_id].matches.filter(function(x){
            if(!x.round_is_complete) {
                x.round_is_complete = true;
                return x;
            }
        });

        for (var i = 0; i < matches.length; i++) {
            var m = matches[i];
            players[m.winner].wins += 1;
            players[m.winner].matches += 1;
            players[m.loser].matches += 1;
        }
        localStorage.tournaments = JSON.stringify(model);
    },

    keyify: function(k) {
        if(typeof k === 'object') {
            for (var i = 0; i < k.length; i++) {
                k[i] = String(k[i]);
            }
        } else if(typeof k === 'number'){
            k = String(k);
        }
        return k;
    }
};