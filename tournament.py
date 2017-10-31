#!/usr/bin/env python
#
# tournament.py -- implementation of a Swiss-system tournament
#

import psycopg2
import math
import manage_duplicate_pairs as dup_manager
currentUserID = 1;
currentTournamentID = 1;



def connect():
    """Connect to the PostgreSQL database.  Returns a database connection."""
    return psycopg2.connect("dbname='tournament' "
                            "user='postgres' "
                            "host='localhost' "
                            "password='password'")

def createUser(name, email, photo):
    """Add user
    Should first check if email is already present
    a second function getUser will be needed

    RETURNS
    Database id of new user
    """
    db = connect()
    c = db.cursor()
    c.execute("INSERT INTO a_user (name, email, photo) \
               VALUES (%s, %s, %s) RETURNING id;", (name, email, photo))
    id = c.fetchone()[0]
    db.commit()
    db.close()
    global currentUserID
    currentUserID = id
    return id

def getTournaments():
    """Get all tournaments for current user
    Each user should be allowed to create an
    unlimited number of tournaments.

    RETURNS
    An array of dictionaris containing...
      id: the id of the tournament
      name: the tournament's name
      user_id: id of the user who own's the tournament
    """
    db = connect()
    c = db.cursor()
    c.execute("SELECT * FROM tournaments \
               WHERE user_id = %s;", (str(currentUserID),))
    tournaments = c.fetchall()
    db.close()
    print tournaments
    data = [dict(name=a, id=b, user_id=c) for a,b,c in tournaments]
    return data


def createTournament(name):
    """Create a new tournament
    Each user should be allowed to create an
    unlimited number of tournaments.

    RETURNS
    Database id of new tournament
    """
    db = connect()
    c = db.cursor()
    c.execute("INSERT INTO tournaments (name, user_id) \
               VALUES (%s, %s) RETURNING id;", (name, str(currentUserID)))
    id = c.fetchone()[0]
    db.commit()
    db.close()
    global currentTournamentID
    currentTournamentID = id
    return id

def getUsers():
    """
    Get all users from database

    RETURNS
    A list of tuples containing all information
    for each user
    """
    db = connect()
    c = db.cursor()
    c.execute("SELECT * FROM a_user");
    results = c.fetchall()
    db.close()
    return results

def getUser(email):
    """
    Queries the db to see if an email exists

    RETURNS
    user's `id` if user exists
    `0` if user does not exist
    """
    db = connect()
    c = db.cursor()
    c.execute("SELECT id FROM a_user WHERE email = %s", (email,));
    result = c.fetchall()
    db.close()
    if result != []:
        return result[0][0]
    return 0

def deleteMatches():
    """Remove all the match records from the database."""
    db = connect()
    c = db.cursor()
    c.execute("DELETE FROM matches;")
    db.commit()
    db.close()


def deletePlayers():
    """Remove all the player records from the database."""
    deleteMatches()
    db = connect()
    c = db.cursor()
    c.execute("DELETE FROM players;")
    db.commit()
    db.close()


def countPlayers():
    """Returns the number of players currently registered."""
    db = connect()
    c = db.cursor()
    c.execute("SELECT COUNT(*) FROM players \
               WHERE tournament_id = %s;", (str(currentTournamentID)))
    rows = c.fetchone()
    db.close()
    return rows[0]


def registerPlayer(name):
    """Adds a player to the tournament database.
    The database assigns a unique serial id number for the player.

    Args:
      name: the player's full name (need not be unique).
    """
    db = connect()
    c = db.cursor()
    # Add the new name
    c.execute("INSERT INTO players (name, tournament_id) \
               VALUES (%s, %s) RETURNING id;",
               (name, str(currentTournamentID)))
    id = c.fetchone()[0]
    db.commit()
    db.close()
    return id


def playerStandings():
    """Returns a list of the players and their win records, sorted by wins.
    This list DOES NOT INCLUDE matches from rounds
    where `round_is_complete` is `False`.

    The first entry in the list should be the player in first place, or a player
    tied for first place if there is currently a tie.

    Returns:
        A list of dictionaries, each of which
        contains {id, name, wins, matches, user_id}:
        id: the player's unique id (assigned by the database)
        name: the player's full name (as registered)
        wins: the number of matches the player has won
        matches: the number of matches the player has played
        user_id: unique id of the user who owns this tournament
    """
    db = connect()
    c = db.cursor()
    c.execute("SELECT * FROM standings WHERE tournament_id = %s", str(currentTournamentID))
    rows = c.fetchall()
    db.close()
    return processStandings(rows)



def fullStandings():
    """Same as `playerStandings()` except...
    Returns standings INCLUDING rounds in progress

    Returns:
      standings: list of dictionaries containing FULL standings
        See `playerStandings()`
    """
    db = connect()
    c = db.cursor()
    # c.execute("SELECT winner, loser FROM matches_with_user_id WHERE user_id = %s AND round_is_complete = false;", str(currentUserID))
    c.execute("SELECT winner, loser FROM matches \
               INNER JOIN players ON (matches.winner = players.id) \
               WHERE tournament_id = %s \
               AND round_is_complete = false;", str(currentTournamentID))
    uncounted = list(c.fetchall())
    db.close()

    # Make 1 list of wins and 2 list of loses from
    # the current (not yet completed) round.
    uncounted_wins = [id1 for id1, id2 in uncounted]
    uncounted_loses = [id2 for id1, id2 in uncounted]

    # Account for the additional win/loses by adding them to standings.
    standings = playerStandings()
    for s in standings:
        if s['id'] in uncounted_wins:
            # Increment wins and matches played.
            s['wins'] += 1
            s['matches'] += 1
        elif s['id'] in uncounted_loses:
            # Increment matches played[
            s['matches'] += 1

    return standings

def processStandings(standings):
    # Convert `Decimal('[VALUE]')` to integer
    return [dict(id=a, name=b, wins=int(c), matches=int(d), user_id=e)
            for a,b,c,d,e in standings]


def reportMatch(winner, loser, should_replace=False, should_clear=False):
    """Records the outcome of a single match between two players.

    Args:
      winner:  the id number of the player who won
      loser:  the id number of the player who lost
      should_replace: replace the last match report
      should_clear: remove the pairing
    """
    try:
        int(winner)
        int(loser)
    except ValueError:
        raise ValueError(
            "\"winner\" and/or \"loser\" input are not integers.\n"
            "Please use the id number of each player to report match results."
        )
    w = str(winner)
    l = str(loser)
    db = connect()
    c = db.cursor()
    if should_replace:
        c.execute("DELETE FROM matches \
                   WHERE winner = %s AND loser = %s;", (l,w))
    if should_clear:
        c.execute("DELETE FROM matches \
                   WHERE winner = %s AND loser = %s;", (w,l))
    else:
        c.execute("INSERT INTO matches \
                   values (%s, %s, false);", (w,l))
    db.commit()
    c.execute("SELECT * FROM standings WHERE id = %s;", (str(winner),))
    w_standings = processStandings([c.fetchone()])[0]
    c.execute("SELECT * FROM standings WHERE id = %s;", (str(loser),))
    l_standings = processStandings([c.fetchone()])[0]

    # Since standings only reflect matches AFTER the round
    # is complete, we need to adjust accordingly.
    if not should_clear:
        w_standings['wins'] += 1
        w_standings['matches'] += 1
        l_standings['matches'] += 1

    # Keep front-end up-to date where we are in the tournament.
    prog = progress(c)

    db.close()
    return dict(winner=w_standings, loser=l_standings, progress=prog)

def swissPairings():
    """Returns a list of pairs of players for the next round of a match.

    Assuming that there are an even number of players registered, each player
    appears exactly once in the pairings.  Each player is paired with another
    player with an equal or nearly-equal win record, that is, a player adjacent
    to him or her in the standings.

    Returns:
      A list of dictionaries, each of which contains {id1, id2}
        id1: the first player's unique id
        id2: the second player's unique id
    """
    print 'current tournament = '+str(currentTournamentID)
    db = connect()
    c = db.cursor()
    # c.execute("SELECT * FROM pairup WHERE tournament_id = %s;", str(currentTournamentID))
    # r = list(reversed( c.fetchall() ))



    c.execute("SELECT * FROM standings WHERE tournament_id = %s;", str(currentTournamentID))
    r = list(reversed( c.fetchall() ))

    i = 0
    pairs = []
    current_pair = []
    while i < len(r):
        current_pair.append(r[i][0])
        current_pair.append(r[i][1])

        if i%2 == 1:
            pairs.append(current_pair)
            current_pair = []
        i +=1



    c.execute("SELECT winner, loser FROM matches \
               INNER JOIN players ON (matches.winner = players.id) \
               WHERE tournament_id = %s \
               AND round_is_complete = true;", str(currentTournamentID))
    match_history = c.fetchall()

    db.close()
    unique_pairs = dup_manager.fixDuplicates(pairs, match_history)
    return [dict(id1=a,name1=b,id2=c,name2=d) for a,b,c,d in unique_pairs]


    # return processStandings([w_standings, l_standings])

def completedMatches():
    """Shows the state of the current round for mataches in which
    winner have been chosen.

    Returns:
      A list of lists, each of which contains [winner, loser]
        winner: the match winner
        loser: the match loser
    """
    db = connect()
    c = db.cursor()
    c.execute("SELECT winner, loser FROM matches \
               INNER JOIN players ON (matches.winner = players.id) \
               WHERE tournament_id = %s \
               AND round_is_complete = false;", str(currentTournamentID))
    matches_completed = c.fetchall()
    db.close()
    return [dict(winner=a, loser=b) for a,b in matches_completed]


def markRoundComplete():
    """Sets all matches to complete
    Function should be called when all match results have been
    reported and user has chosen to move on to the next round
    """
    db = connect()
    c = db.cursor()
    c.execute("UPDATE matches SET round_is_complete = true \
               FROM players WHERE matches.winner = players.id \
               AND players.tournament_id = %s \
               AND matches.round_is_complete = false;", str(currentTournamentID))
    db.commit()
    db.close()

def progress(c=None):
    """Returns data on tournament progress including number of rounds,
    which round we're currently in, and number of matches.

    Args:
      c: optionally db cursor can be provided for efficency if another
         function in `tournament` is calling `progress`.
    Returns:
      `total_matches`: number of matches to crown a champion.
      `match_count`: current number of matches played.
      `player_count`: total number of players.
      `total_rounds`: number of rounds to crown a champion.
      `this_round`: current round being played.
    """
    isNewSession = True if c == None else False
    if isNewSession:
        db = connect()
        c = db.cursor()
    c.execute("SELECT COUNT(*) FROM players \
               WHERE tournament_id = %s;", str(currentTournamentID))
    player_count = c.fetchone()[0]
    if player_count > 0:
        c.execute("SELECT COUNT(*) FROM matches \
                   INNER JOIN players ON (matches.winner = players.id) \
                   WHERE tournament_id = %s \
                   AND round_is_complete = true;", str(currentTournamentID))
        match_count = c.fetchone()[0]

        # # Determine number of rounds expected to find a winner.
        total_rounds = int(round(math.log(player_count,2)))

        # # Determine number of rounds expected to find a winner.
        # p = float(player_count)
        # total_rounds = 0
        # while p > 1:
        #     p = p/2.0
        #     if p % 2.0 == 1.0 and not p == 1.0:
        #         p -= 1.0
        #     total_rounds += 1
        # print 'total rounds is '+str(total_rounds)


        total_matches = (player_count/2) * total_rounds
        this_round = int((float(match_count)/float(total_matches))*float(total_rounds))+1
    else:
        match_count=total_rounds=total_matches=this_round = 0
    if isNewSession:
        db.close()

    return dict(player_count=player_count,
                match_count=match_count,
                total_matches=total_matches,
                total_rounds=total_rounds,
                this_round=this_round)





