from flask import Flask, render_template, request

import psycopg2
import json
import tournament

from my_path_data import root_url
from my_path_data import html_index_root


app = Flask(__name__)
app.secret_key = 'super_secret_key'

@app.route(root_url+'/', methods=['GET', 'POST'])
def index():
    if request.method == 'POST':
        print request.form
        if 'newPlayer' in request.form:
            id = tournament.registerPlayer(
                            request.form['newPlayer'])
            return '{"id": %s}'%id
        elif 'reportResult' in request.form:
            r = request.form['reportResult'].split(',')
            print r
            try:
                winner = int(r[0])
                loser = int(r[1])
                should_replace = bool(int(r[2]))
                should_clear = bool(int(r[3]))
                s = tournament.reportMatch(winner, loser,
                                           should_replace, should_clear)
                return json.dumps(s)
            except:
                print 'Server error. Result could not be recorded'
        elif 'roundComplete' in request.form:
            tournament.markRoundComplete()
            p = tournament.progress()
            return json.dumps(p)
        elif 'newTournament' in request.form:
            name = request.form['newTournament']
            id = tournament.createTournament(name)
            return json.dumps(dict(id=id, name=name))
        return 'ERR'
    else:
        """Serve the client-side application."""
        return render_template('index.html')


@app.route(root_url+'/tournaments/JSON/')
def tournamentsJSON():
    tournaments = tournament.getTournaments()
    print tournaments
    return json.dumps(dict(tournaments=tournaments))

@app.route(root_url+'/standings/JSON/')
def standingsJSON():
    standings = tournament.playerStandings()
    return json.dumps(dict(standings=standings))

@app.route(root_url+'/swiss-pairing/JSON/')
def pairingJSON():
    pairings = tournament.swissPairings()
    progress = tournament.progress()
    return json.dumps(dict(pairings=pairings['pairs'], 
                           tournamentName=pairings['tournamentName'], 
                           progress=progress))

@app.route(root_url+'/tournament/<int:tournament_id>/JSON/')
def roundJSON(tournament_id):
    tournament.currentTournamentID = tournament_id
    standings = tournament.fullStandings()
    print standings
    completed_matches = tournament.completedMatches()
    progress = tournament.progress()
    return json.dumps(dict(standings=standings,
                           completed_matches=completed_matches,
                           progress=progress))

@app.route(root_url+'/progress/JSON/')
def progressJSON():
    return json.dumps(dict(progress=tournament.progress()))


@app.context_processor
def utility_processor():
    """
    Make several useful functions directly
    accesible by jinja2. That way we can call
    them directly from within each template
    and avoid cluttering up the view functions.
    """
    def links_root():
    	return html_index_root

    return dict(links_root=links_root)

if __name__ == '__main__':
    app.debug = True
    app.run(host='0.0.0.0', port=5000)