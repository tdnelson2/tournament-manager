from flask import Flask, render_template, request, redirect, url_for
from flask import session
from modules.login import login
from modules.decorators import login_required, logout_required

import psycopg2
import json
import tournament
import pairing_tools

from my_path_data import root_url
from my_path_data import html_index_root


app = Flask(__name__)
app.secret_key = 'super_secret_key'
app.register_blueprint(login)


# User account tournaments

@app.route(root_url+'/', methods=['GET', 'POST'])
@login_required
def index():
    if request.method == 'POST':
        print request.form
        if 'newPlayer' in request.form:
            id = tournament.registerPlayer(
                            request.form['newPlayer'])
            return '{"id": %s}'%id
        elif 'reportResult' in request.form:
            r = json.loads(request.form['reportResult'])
            print r
            # try:
            s = tournament.reportMatch(r['winner_id'], r['loser_id'],
                                       r['shouldReplace'], r['shouldClear'])
            return json.dumps(s)
            # except:
            #     print 'Server error. Result could not be recorded'
        elif 'roundComplete' in request.form:
            tournament.markRoundComplete()
            p = tournament.progress()
            return json.dumps(p)
        elif 'newTournament' in request.form:
            name = request.form['newTournament']
            id = tournament.createTournament(name)
            return json.dumps(dict(id=id, name=name))
        elif 'deleteTournaments' in request.form:
            tournaments = json.loads(request.form['deleteTournaments'])
            r = tournament.deleteTournaments(tournaments)
            return json.dumps(dict(result=r))
        elif 'updateTournamentNames' in request.form:
            tournaments = json.loads(request.form['updateTournamentNames'])
            r = tournament.updateTournamentNames(tournaments)
            return json.dumps(dict(result=r))
        elif 'deletePlayers' in request.form:
            players = json.loads(request.form['deletePlayers'])
            r = tournament.deletePlayers(players)
            return json.dumps(dict(result=r))
        elif 'updatePlayerNames' in request.form:
            players = json.loads(request.form['updatePlayerNames'])
            r = tournament.updatePlayerNames(players)
            return json.dumps(dict(result=r))
        return 'ERR'
    else:
        """Serve the client-side application."""
        return render_template('index.html',
                               user_picture=session['picture'],
                               username=session['username'])


@app.route(root_url+'/tournaments/JSON/')
@login_required
def tournamentsJSON():
    tournaments = tournament.getTournaments()
    print tournaments
    return json.dumps(dict(tournaments=tournaments))


@app.route(root_url+'/standings/JSON/')
@login_required
def standingsJSON():
    standings = tournament.playerStandings()
    return json.dumps(dict(standings=standings))


@app.route(root_url+'/swiss-pairing/JSON/')
@login_required
def pairingJSON():
    pairings = tournament.swissPairings()
    progress = tournament.progress()
    return json.dumps(dict(pairings=pairings['pairs'],
                           tournamentName=pairings['tournamentName'],
                           progress=progress))


@app.route(root_url+'/tournament/<int:tournament_id>/JSON/')
@login_required
def roundJSON(tournament_id):
    session['tournament_id'] = tournament_id
    standings = tournament.fullStandings()
    print standings
    completed_matches = tournament.completedMatches()
    progress = tournament.progress()
    return json.dumps(dict(standings=standings,
                           completed_matches=completed_matches,
                           progress=progress))


@app.route(root_url+'/progress/JSON/')
@login_required
def progressJSON():
    return json.dumps(dict(progress=tournament.progress()))


# Guest tournaments


@app.route(root_url+'/guest/', methods=['GET', 'POST'])
@logout_required
def guest():
    """Guest mode
    Allows the user to use the app without creating
    an account. Data is managed and saved locally
    in localStorage. Swiss pairing, however, is still done
    by the server.
    """
    if request.method == 'POST':
        if 'swiss_pairing_requested' in request.form:
            r = json.loads(request.form['swiss_pairing_requested'])
            print r

            pairings = pairing_tools.pairup(r['standings'],
                                            r['matches'],
                                            r['tournament_name'])

            progress = pairing_tools.calculateProgress(len(r['standings']),
                                                       len(r['matches']))
            return json.dumps(dict(pairings=pairings['pairs'],
                                   tournamentName=pairings['tournamentName'],
                                   progress=progress))
        if 'progress' in request.form:
            r = json.loads(request.form['progress'])
            print r

            progress = pairing_tools.calculateProgress(len(r['standings']),
                                                       len(r['matches']))
            return json.dumps(dict(progress=progress))
        return 'ERR'
    else:
        """Serve the client-side application in guest mode."""
        return render_template('index.html',
                               user_picture=None,
                               username=None)

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
    def links_and_scripts():
        return render_template('links-and-scripts.html')
    def login_provider():
        """
        used to set the logout link depending on
        if we're logged in under google or facebook
        """
        if 'provider' in session:
            return session['provider']
    def logout_url():
        if 'provider' in session:
            if session['provider'] == 'google':
                return url_for('login.gdisconnect')
            if session['provider'] == 'facebook':
                return url_for('login.fbdisconnect')
            return None

    return dict(links_root=links_root,
                render_links_and_scripts=links_and_scripts,
                login_provider=login_provider,
                logout_url=logout_url)

if __name__ == '__main__':
    app.debug = True
    app.run(host='0.0.0.0', port=5000)