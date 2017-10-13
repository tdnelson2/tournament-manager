from flask import Flask, render_template, request

import psycopg2
import json
import tournament
import sys

from my_path_data import root_url
from my_path_data import html_index_root


app = Flask(__name__)
app.secret_key = 'super_secret_key'

@app.route(root_url+'/', methods=['GET', 'POST'])
def index():
    if request.method == 'POST':
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
                s = tournament.reportMatch(winner, loser, should_replace, should_clear)
                print s
                return json.dumps(standings=[s])
            except:
                print sys.exc_info()[0]
                print 'Server error. Result could not be recorded'
        return 'OK'
    else:
        """Serve the client-side application."""
        return render_template('index.html')


@app.route(root_url+'/standings/JSON/')
def standingsJSON():
    standings = tournament.playerStandings()
    return json.dumps(dict(standings=standings))

@app.route(root_url+'/swiss-pairing/JSON/')
def pairingJSON():
    pairings = tournament.swissPairings()
    return json.dumps(dict(pairings=pairings))


@app.route(root_url+'/current-state/JSON/')
def roundJSON():
    standings = tournament.fullStandings()
    pairings = tournament.currentPairings()
    return json.dumps(dict(standings=standings, pairings=pairings))


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