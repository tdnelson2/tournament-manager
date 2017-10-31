-- Table definitions for the tournament project.


DROP DATABASE IF EXISTS tournament;

CREATE DATABASE tournament;

\c tournament;

CREATE TABLE a_user ( id SERIAL,
                      name TEXT,
                      email TEXT,
                      photo TEXT,
                      PRIMARY KEY (id) );

CREATE TABLE tournaments ( name TEXT,
                           id SERIAL,
                           user_id INTEGER REFERENCES a_user (id),
                           PRIMARY KEY (id)  );

CREATE TABLE players ( name TEXT,
                       id SERIAL,
                       tournament_id INTEGER REFERENCES tournaments (id) ON DELETE CASCADE,
                       PRIMARY KEY (id) );

CREATE TABLE matches ( winner INTEGER REFERENCES players (id) ON DELETE CASCADE,
					   loser INTEGER REFERENCES players (id) ON DELETE CASCADE,
                       round_is_complete BOOLEAN );


CREATE VIEW matches_from_completed_rounds AS
    SELECT
        *
    FROM
        matches
    WHERE
        round_is_complete = true;


-- show how each player is doing sorted by number of games played and wins
CREATE VIEW standings AS
    SELECT
        player_wins.id,
        player_wins.name,
        SUM(player_wins.wins) AS wins,
        SUM(player_loses.loses)+SUM(player_wins.wins) AS totalplayed,
        player_wins.tournament_id
    FROM
        -- add up wins for each player (players may appear twice)
        (
        SELECT
            players.id, players.name, COUNT(matches_from_completed_rounds.winner) AS wins, players.tournament_id
        FROM
            players
        LEFT JOIN
            matches_from_completed_rounds
        ON players.id = matches_from_completed_rounds.winner
        GROUP BY players.id, players.name
        )
        AS player_wins
    LEFT JOIN
        -- add up loses for each player
        (
        SELECT
            players.id, COUNT(matches_from_completed_rounds.loser) AS loses
        FROM
            players
        LEFT JOIN
            matches_from_completed_rounds
        ON players.id = matches_from_completed_rounds.loser
        GROUP BY players.id
        )
        AS player_loses
    ON player_wins.id = player_loses.id
    GROUP BY player_wins.id, player_wins.name, player_wins.tournament_id
    ORDER BY SUM(player_wins.wins), player_wins.tournament_id DESC;