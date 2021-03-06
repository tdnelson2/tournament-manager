#!/usr/bin/env python
#
# tournament.py -- implementation of a Swiss-system tournament
#

import psycopg2
from psycopg2 import sql as sql2
from functools import wraps
from flask import session
import re
import pairing_tools
# currentUserID = 1;
# currentTournamentID = 1;


standingsQuery = "SELECT * FROM standings \
                  WHERE tournament_id = %s \
                  ORDER BY wins DESC, totalPlayed, id;"



def connect():
    """Connect to the PostgreSQL database. Returns a database connection."""
    return psycopg2.connect("dbname='tournament' "
                            "user='postgres' "
                            "host='localhost' "
                            "password='password'")

def addUserID(func):
    """
    A decorator to add the current user's id to kwargs.
    """
    @wraps(func)
    def wrap(*args, **kwargs):
        kwargs['currentUserID'] = session['user_id']
        return func(*args, **kwargs)
    return wrap

def addTournamentID(func):
    """
    A decorator to add the currently open tournament's id to kwargs.
    """
    @wraps(func)
    def wrap(*args, **kwargs):
        kwargs['currentTournamentID'] = session['tournament_id']
        return func(*args, **kwargs)
    return wrap

def establishConnection(func):
    """
    A decorator to establish database connection
    and create a cursor.
    """
    @wraps(func)
    def wrap(*args, **kwargs):
        if not 'c' in kwargs:
            db = connect()
            kwargs['db'] = db
            kwargs['c'] = db.cursor()
        return func(*args, **kwargs)
    return wrap

@establishConnection
def createUser(name, email, photo, db, c):
    """Create a user

    RETURNS
    Database id of new user
    """
    c.execute("INSERT INTO a_user (name, email, photo) \
               VALUES (%s, %s, %s) RETURNING id;", (name, email, photo))
    id = c.fetchone()[0]
    db.commit()
    db.close()
    # global currentUserID
    # currentUserID = id
    return id

@addUserID
@establishConnection
def getTournaments(currentUserID, db, c,):
    """Get all tournaments for current user
    Each user should be allowed to create an
    unlimited number of tournaments.

    RETURNS
    An array of dictionaries containing...
      id: the id of the tournament
      name: the tournament's name
      user_id: id of the user who own's the tournament
    """
    c.execute("SELECT * FROM tournaments \
               WHERE user_id = %s;", (str(currentUserID),))
    tournaments = c.fetchall()
    db.close()
    print tournaments
    data = [dict(name=a, id=b, user_id=c) for a,b,c in tournaments]
    return data


@addUserID
@establishConnection
def createTournament(name, currentUserID, db, c):
    """Create a new tournament
    Each user should be allowed to create an
    unlimited number of tournaments.

    RETURNS
    Database id of new tournament
    """
    c.execute("INSERT INTO tournaments (name, user_id) \
               VALUES (%s, %s) RETURNING id;", (name, str(currentUserID)))
    id = c.fetchone()[0]
    db.commit()
    db.close()
    # global currentTournamentID
    # currentTournamentID = id
    return id

@addUserID
def deleteTournaments(ids, currentUserID):
    """Delete tournaments and all players/matches
    contained within

    RETURNS
    Database returns True if succesful False if not.
    """

    return deleteItems(ids, 'tournaments', 'user_id', str(currentUserID))

@addTournamentID
def deletePlayers(ids, currentTournamentID):
    """Delete players

    RETURNS
    Database returns True if succesful False if not.
    """

    return deleteItems(ids, 'players', 'tournament_id',
                       str(currentTournamentID))

@establishConnection
def deleteItems(ids, table_name, column_name, column_value, db, c):
    """Delete items from a list of ids

    RETURNS
      True if succesful False if not
    """
    if len(ids) == 0:
        r = False

    # try:
    tupIDs = tuple(ids)

    # Populate the template with our table and column.
    delete_query = sql2.SQL("DELETE FROM {0} WHERE id IN \
                            %s AND {1} = %s;").format(
                            sql2.Identifier(table_name),
                            sql2.Identifier(column_name))

    c.execute(delete_query, (tupIDs,  column_value))
    db.commit()
    r = True
    # except:
    #     r = False
    db.close()
    return r

@addUserID
def updateTournamentNames(tournaments, currentUserID):
    """Update tournament names
    ARGS
     list of lists, each of which contain
     `id`: unique tournament identifier
     `name`: new name to be updated

    RETURNS
    True if succesful False if not
    """
    return updateNames(tournaments, 'tournaments',
                       'user_id', str(currentUserID))

@addTournamentID
def updatePlayerNames(players, currentTournamentID):
    """Update player names
    ARGS
     list of lists, each of which contain
     `id`: unique player identifier
     `name`: new name to be updated

    RETURNS
    True if succesful False if not
    """
    return updateNames(players, 'players',
                       'tournament_id', str(currentTournamentID))



@establishConnection
def updateNames(new_values, table_name, column_name, column_value, db, c):
    """Update values from columns named `name`
    ARGS
     `new_values`: list of lists, each of with contain
       `id`: unique item identifier
       `name`: new name to be updated
       `table_name`: the table to update
       `column_name`: an additional column to filter using `column_value`
       `column_value`: a value in `column_name` to restrict `new_values`

    RETURNS
    True if succesful False if not
    """
    print column_value
    if len(new_values) == 0:
        return False

    try:
        new_values = [tuple(x) for x in new_values]

        # Add the where value to the list of new values
        new_values.append(column_value)

        # Populate the template with our table, column, and new values
        update_query = sql2.SQL("UPDATE {0} AS t\
                        SET name = e.name\
                        FROM (VALUES "+','.join(['%s'] * (len(new_values)-1))+")\
                        AS e(id, name)\
                        WHERE e.id = t.id\
                        AND t.{1} = %s;").format(
                        sql2.Identifier(table_name),
                        sql2.Identifier(column_name))

        print  ' '.join(update_query.as_string(c).replace('\n', '').split())
        q = c.mogrify(' '.join(update_query.as_string(c).replace('\n', '').split()), new_values)
        print q

        c.execute(q, new_values)
        db.commit()
        r = True
    except:
        r = False
    db.close()
    return r


@establishConnection
def getUsers(db, c):
    """
    Get all users from database

    RETURNS
    A list of tuples containing all information
    for each user
    """
    c.execute("SELECT * FROM a_user");
    results = c.fetchall()
    db.close()
    return results

@establishConnection
def getUser(email, db, c):
    """
    Queries the db to see if an email exists

    RETURNS
    user's `id` if user exists
    `None` if user does not exist
    """
    print 'second get user is called'
    c.execute("SELECT * FROM a_user WHERE email = %s", (email,));
    results = c.fetchall()
    db.close()
    if results != []:
        r = results[0]
        return dict(id=r[0], name=r[1], email=r[2], photo=r[3])
    return None


@addTournamentID
@establishConnection
def countPlayers(currentTournamentID, db, c):
    """Returns the number of players currently registered."""
    c.execute("SELECT COUNT(*) FROM players \
               WHERE tournament_id = %s;", (str(currentTournamentID),))
    rows = c.fetchone()
    db.close()
    return rows[0]


@addTournamentID
@establishConnection
def registerPlayer(name, currentTournamentID, db, c):
    """Adds a player to the tournament database.
    The database assigns a unique serial id number for the player.

    Args:
      name: the player's full name (need not be unique).
    """
    # Add the new name
    c.execute("INSERT INTO players (name, tournament_id) \
               VALUES (%s, %s) RETURNING id;",
               (name, str(currentTournamentID)))
    id = c.fetchone()[0]
    db.commit()
    db.close()
    return id


@addTournamentID
@establishConnection
def playerStandings(currentTournamentID, db, c):
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
    c.execute(standingsQuery, (str(currentTournamentID),))
    rows = c.fetchall()
    db.close()
    return processStandings(rows)



@addTournamentID
@establishConnection
def fullStandings(currentTournamentID, db, c):
    """Same as `playerStandings()` except...
    Returns standings INCLUDING rounds in progress

    Returns:
      standings: list of dictionaries containing FULL standings
        See `playerStandings()`
    """
    print currentTournamentID
    print str(currentTournamentID)
    c.execute("SELECT winner, loser FROM matches \
               INNER JOIN players ON (matches.winner = players.id) \
               WHERE tournament_id = %s \
               AND round_is_complete = false;", (str(currentTournamentID),))
    uncounted = list(c.fetchall())
    db.close()

    # Make 1 list of wins and 1 list of loses from
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


def reportMatch(winner, loser, vm_round, should_replace=False, should_clear=False):
    """Records the outcome of a single match between two players.
       First checks if match has already been played. If it hasn't,
       the match is recorded and returns . If it has, returns `None`

    Args:
      `winner`:  the id number of the player who won
      `loser`:  the id number of the player who lost
      `should_replace`: replace the last match report
      `should_clear`: remove the last match report
    RETURNS:
      If successful: Dictionary containing keys:
        `winner`: winner's current standings.
        `loser`: loser's current standings.
        `progress`: a `progress` dictionary (see `progress()`)
      If match has already been played:
        `None`: The match result will be discarded because
                it has already been reported.
                (If 2 sessions are accessing the same tournament,
                it is possible one session will have already reported
                a result. If the other session attempts to
                report a result from the same match, returning
                `None` will signal the front-end to reload the
                tournament. By doing so we ensure the user is
                seeing the most up-to-date information)
    """
    db = connect()
    c = db.cursor()
    try:
        int(winner)
        int(loser)
    except ValueError:
        raise ValueError(
            "\"winner\" and/or \"loser\" input are not integers.\n"
            "Please use the id number of each player to report match results."
        )
        db.close()
        return None
    w = str(winner)
    l = str(loser)

    if vm_round != progress(c)['this_round']:
        """ If database is reporting we are on a different round
            from what the front-end is saying, another session
            has already modified this match. """
        db.close()
        return None

    p = swissPairings(db, c)
    if not pairing_tools.pairIsInPairs([winner, loser], p['pairs']):
        """ Validate if the pair being reported 
            is a pair listed in the original pairings """
        db.close()
        return None


    # Check if the SAME result has already been reported.
    c.execute("SELECT * FROM matches \
               WHERE winner = %s AND loser = %s ", (w,l))
    sameWasReported = c.fetchone() != None
    oppositeWasReported = False

    if not sameWasReported:
        # Check if the OPPOSITE result has already been reported.
        c.execute("SELECT * FROM matches \
                   WHERE winner = %s AND loser = %s ", (l,w))
        oppositeWasReported = c.fetchone() != None

    # Check if the NO result has been reported.
    nothingWasReported = not sameWasReported and not oppositeWasReported

    if should_replace:
        if sameWasReported or nothingWasReported:
            """ If match has already been reported and we were
                expecting to replace or match is cleared,
                another session has already
                modified this match. """
            db.close()
            return None

        c.execute("DELETE FROM matches \
                   WHERE winner = %s AND loser = %s;", (l,w))
        db.commit()

    if should_clear:
        if oppositeWasReported or nothingWasReported:
            """ If opposit of what we were expecting is present
                or match is cleared, another session
                has already modified this match. """
            db.close()
            return None

        c.execute("DELETE FROM matches \
                   WHERE winner = %s AND loser = %s;", (w,l))
        db.commit()

    else:
        if not should_replace and not nothingWasReported:
            """ If something has already been reported,
                another sessions has already
                modified this match. """
            db.close()
            return None

        c.execute("INSERT INTO matches \
                   VALUES (%s, %s, false);", (w,l))
        db.commit()
    c.execute("SELECT * FROM standings WHERE id = %s;", (w,))
    w_standings = processStandings([c.fetchone()])[0]
    c.execute("SELECT * FROM standings WHERE id = %s;", (l,))
    l_standings = processStandings([c.fetchone()])[0]

    # Since standings only reflect matches AFTER the round
    # is complete, we need to adjust accordingly.
    if not should_clear:
        w_standings['wins'] += 1
        w_standings['matches'] += 1
        l_standings['matches'] += 1

    # Keep front-end up-to date with where we are in the tournament.
    prog = progress(c)

    db.close()
    return dict(winner=w_standings, loser=l_standings, progress=prog)

def swissPairings(db=None, c=None):
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

    currentTournamentID = session['tournament_id']
    shouldCloseDB = False
    if db == None and c == None:
        shouldCloseDB = True
        db = connect()
        c = db.cursor()

    print 'current tournament = '+str(currentTournamentID)

    c.execute(standingsQuery, (str(currentTournamentID),))
    standings =  c.fetchall()

    c.execute("SELECT winner, loser FROM matches \
               INNER JOIN players ON (matches.winner = players.id) \
               WHERE tournament_id = %s \
               AND round_is_complete = true;", (str(currentTournamentID),))
    match_history = c.fetchall()

    c.execute("SELECT name FROM tournaments WHERE id = %s", (str(currentTournamentID),))
    tournament_name = c.fetchone()[0]

    if shouldCloseDB:
        db.close()

    return pairing_tools.pairup(standings, match_history, tournament_name)


@addTournamentID
@establishConnection
def completedMatches(currentTournamentID, db, c):
    """Shows the state of the current round for mataches in which
    winner have been chosen.

    Returns:
      A list of lists, each of which contains [winner, loser]
        winner: the match winner
        loser: the match loser
    """
    c.execute("SELECT winner, loser FROM matches \
               INNER JOIN players ON (matches.winner = players.id) \
               WHERE tournament_id = %s \
               AND round_is_complete = false;", (str(currentTournamentID),))
    matches_completed = c.fetchall()
    db.close()
    return [dict(winner=a, loser=b) for a,b in matches_completed]


@addTournamentID
@establishConnection
def markRoundComplete(currentTournamentID, db, c):
    """Sets all matches to complete
    Function should be called when all match results have been
    reported and user has chosen to move on to the next round
    """
    c.execute("UPDATE matches SET round_is_complete = true \
               FROM players WHERE matches.winner = players.id \
               AND players.tournament_id = %s \
               AND matches.round_is_complete = false;", (str(currentTournamentID),))
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
    currentTournamentID = session['tournament_id']
    isNewSession = True if c == None else False
    if isNewSession:
        db = connect()
        c = db.cursor()
    c.execute("SELECT COUNT(*) FROM players \
               WHERE tournament_id = %s;", (str(currentTournamentID),))
    player_count = c.fetchone()[0]

    c.execute("SELECT COUNT(*) FROM matches \
               INNER JOIN players ON (matches.winner = players.id) \
               WHERE tournament_id = %s \
               AND round_is_complete = true;", (str(currentTournamentID),))
    match_count = c.fetchone()[0]

    if isNewSession:
        db.close()

    return pairing_tools.calculateProgress(player_count, match_count)






