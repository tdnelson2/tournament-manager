#!/usr/bin/env python
#
# tournament.py -- implementation of a Swiss-system tournament
#

import psycopg2
currentUserID = 1;


def connect():
    """Connect to the PostgreSQL database.  Returns a database connection."""
    return psycopg2.connect("dbname='tournament' user='postgres' host='localhost' password='password'")

def createUser(name, email, photo):
    """Add user
    Should first check if email is already present
    a second function getUser will be needed

    RETURNS
    Database id of new user
    """
    db = connect()
    c = db.cursor()
    c.execute("INSERT INTO a_user (name, email, photo) values (%s, %s, %s);", (name, email, photo))
    db.commit()
    c.execute("SELECT id FROM a_user WHERE email = %s", (email,));
    id = c.fetchone()[0]
    db.close
    global currentUserID
    currentUserID = id
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
    db.close
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
    db.close
    if result != []:
        return result[0][0]
    return 0

def deleteMatches():
    """Remove all the match records from the database."""
    db = connect()
    c = db.cursor()
    c.execute("DELETE FROM matches;")
    db.commit()
    db.close


def deletePlayers():
    """Remove all the player records from the database."""
    deleteMatches()
    db = connect()
    c = db.cursor()
    c.execute("DELETE FROM players;")
    db.commit()
    db.close


def countPlayers():
    """Returns the number of players currently registered."""
    db = connect()
    c = db.cursor()
    c.execute("SELECT COUNT(*) FROM players WHERE user_id = %s;", str(currentUserID))
    rows = c.fetchone()
    db.close
    return rows[0]


def registerPlayer(name):
    """Adds a player to the tournament database.

    The database assigns a unique serial id number for the player.

    Args:
      name: the player's full name (need not be unique).
    """
    p_count = countPlayers()
    sql = "INSERT INTO players (name, user_id, placeholder) values (%s, %s, %s)"

    db = connect()
    c = db.cursor()

    # REMOVE PLACEHOLDER ROW
    # Placeholder rows will be present to maintain
    # database integrity. It does so by keeping
    # total row count to an even number thus
    # preventing players from separate users from
    # bleeding into each other's pairings.
    placeholderExists = False
    e = "FROM players WHERE user_id = %s AND placeholder = true"
    e = e % str(currentUserID)
    c.execute("SELECT EXISTS (SELECT 1 "+e+");")
    isPlaceholder = c.fetchone()[0]
    # Remove the placeholder if it exists
    if isPlaceholder == True:
        c.execute("DELETE "+e+";")
        placeholderExists = True

    if p_count % 2 == 0 and not placeholderExists:
        # Add a placeholder if player count will be odd
        # once the new player has been added. That means
        # if the count is currently even, it would become
        # odd if we were to add a player without first
        # inserting a placeholder row.
        c.execute(sql+";", ('PLACEHOLDER', str(currentUserID), 'true'))

    # Add the new name
    c.execute(sql+" RETURNING id;", (name, str(currentUserID), 'false'))
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
    c.execute("SELECT * FROM standings WHERE user_id = %s", str(currentUserID))
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
               WHERE user_id = %s \
               AND round_is_complete = false;", str(currentUserID))
    uncounted = list(c.fetchall())
    db.close()
    uncounted_wins = [id1 for id1, id2 in uncounted]
    uncounted_loses = [id2 for id1, id2 in uncounted]

    # [dict(id=a, name=b, wins=int(c), matches=int(d), user_id=e)

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
            for a,b,c,d,e,f in standings if f == False]


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
                   WHERE winner = %s AND loser = %s", (l,w))
    if should_clear:
        c.execute("DELETE FROM matches \
                   WHERE winner = %s AND loser = %s", (w,l))
    else:
        c.execute("INSERT INTO matches \
                   values (%s, %s, %s, %s)", (w,l, str(currentUserID), 'true'))
    db.commit()
    c.execute("SELECT * FROM standings WHERE id = %s;", (str(winner),))
    w_standings = processStandings(c.fetchone())
    c.execute("SELECT * FROM standings WHERE id = %s;", (str(loser),))
    l_standings = processStandings(c.fetchone())

    # Since standings only reflect matches AFTER the round
    # is complete, we need to adjust accordingly.
    if not should_clear:
        w_standings['wins'] += 1
        w_standings['matches'] += 1
        l_standings['matches'] += 1
    return dict(winner=w_standings, loser=l_standings)
    db.close()


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
    db = connect()
    c = db.cursor()
    c.execute("SELECT * FROM pairup WHERE user_id = %s;", str(currentUserID))
    rows = list(reversed( c.fetchall() ))
    db.close()
    return [dict(id1=a,name1=b,id2=c,name2=d) for a,b,c,d,e in rows]


    return processStandings([w_standings, l_standings])

def currentPairings():
    """Same as `swissPairings()` except...
    Returns pairings from rounds that a currently in progress INCLUDING
    winners that have been selected in previous user sessions
    Useful for instances such as when a user ends their session mid-way through
    a round. 

    Returns:
      A list of lists, each of which contains [id1, id2, match_played]
        id1: the first player's unique id (the winner if match_played is true)
        id2: the second player's unique id (the loser if match_played is true)
        match_played: boolean indicating whether a winner has been selected
    """
    db = connect()
    c = db.cursor()
    c.execute("SELECT id1, id2 FROM pairup \
               WHERE user_id = %s;", str(currentUserID))
    current_round = c.fetchall()
    print "current round "+str(current_round)
    c.execute("SELECT winner, loser FROM matches \
               INNER JOIN players ON (matches.winner = players.id) \
               WHERE user_id = %s \
               AND round_is_complete = false;", str(currentUserID))
    current_results = c.fetchall()
    print "current matches "+str(current_results)
    db.close()
    pairs = []
    for x in current_round:
        # Check if paring in either or is present in `current_results`
        # If it is, a winner has already a been chosen
        a = (x[0],x[1])
        b = (x[1],x[0])
        if a in current_results:
            # Winner reported.
            a = a + (True,)
            pairs.append(a)
        elif b in current_results:
            # Winner reported.
            b = b + (True,)
            pairs.append(b)
        else:
            # Match winner has not been reported.
            a = a + (False,)
            pairs.append(a)
    return pairs


def markRoundComplete():
    """Sets all matches to complete
    Function should be called when all match results have been
    reported and user has chosen to move on to the next round
    """
    db = connect()
    c = db.cursor()
    c.execute("UPDATE matches SET round_is_complete = true \
               FROM players WHERE matches.winner = players.id \
               AND players.user_id = %s \
               AND matches.round_is_complete = false;", str(currentUserID))
    c.commit()
    db.close()





