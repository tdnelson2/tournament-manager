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
    # Convert `Decimal('[VALUE]')` to integer
    # r = []
    r = [dict(id=a, name=b, wins=int(c), matches=int(d),
              user_id=e)
         for a,b,c,d,e,f in rows if f == False]
    return r


def reportMatch(winner, loser):
    """Records the outcome of a single match between two players.

    Args:
      winner:  the id number of the player who won
      loser:  the id number of the player who lost
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
    c.execute("INSERT INTO matches values (%s, %s)", (w,l))
    db.commit()
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
