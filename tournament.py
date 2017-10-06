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

def registerPlayers(names):
    """
    Adds multible players at a time.
    IF THE COUNT OF THE ARRAY OF NAMES IS 
    ODD, NONE OF THE PLAYERS WILL BE ADDED

    This is done to ensure the integrity of the 
    database is maintained
    """
    if len(names) % 2 == 0:
        print str(names)
        # db = connect()
        # c = db.cursor()
        # c.execute("INSERT INTO players(name, user_id) SELECT x FROM unnest(ARRAY[%s]) x ", (str(currentUserID)), names)
        # # c.execute("INSERT INTO players (name, user_id) values (%s, %s)", (name, str(currentUserID)))
        # db.commit()
        # db.close()
        return True
    return False


def registerPlayer(name):
    """Adds a player to the tournament database.
    
    INTERNAL USE ONLY

    USE `registerPlayers` INSTEAD TO ENSURE
    DATABASE INTEGRITY IS MAINTAINED.

    The database assigns a unique serial id number for the player.  (This
    should be handled by your SQL database schema, not in your Python code.)

    Args:
      name: the player's full name (need not be unique).
    """

    db = connect()
    c = db.cursor()
    c.execute("INSERT INTO players (name, user_id) values (%s, %s)", (name, str(currentUserID)))
    db.commit()
    db.close()


def playerStandings():
    """Returns a list of the players and their win records, sorted by wins.

    The first entry in the list should be the player in first place, or a player
    tied for first place if there is currently a tie.

    Returns:
      A list of tuples, each of which contains (id, name, wins, matches):
        id: the player's unique id (assigned by the database)
        name: the player's full name (as registered)
        wins: the number of matches the player has won
        matches: the number of matches the player has played
    """
    db = connect()
    c = db.cursor()
    c.execute("SELECT * FROM standings WHERE user_id = %s", str(currentUserID))
    rows = c.fetchall()
    db.close()
    return rows


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
      A list of tuples, each of which contains (id1, name1, id2, name2)
        id1: the first player's unique id
        name1: the first player's name
        id2: the second player's unique id
        name2: the second player's name
    """
    db = connect()
    c = db.cursor()
    c.execute("SELECT * FROM pairup WHERE user_id = %s;", str(currentUserID))
    rows = c.fetchall()
    db.close()
    return list(reversed(rows))
