-- Table definitions for the tournament project.


DROP DATABASE IF EXISTS tournament;

CREATE DATABASE tournament;

\c tournament;

CREATE TABLE a_user ( id SERIAL,
                      name TEXT,
                      email TEXT,
                      photo TEXT,
                      PRIMARY KEY (id) );

INSERT INTO a_user VALUES (1, 'tim', 'tdnelson@gmail.com', 'path/to/photo.jpg');
INSERT INTO a_user VALUES (2, 'tim nelson', 'tdnelson@outlook.com', 'path/to/photo.jpg');
INSERT INTO a_user VALUES (3, 'ted', 'tneislon@outlook.com', 'path/to/photo.jpg');
INSERT INTO a_user VALUES (4, 'tam', 'tam@gmail.com', 'path/to/photo.jpg');
INSERT INTO a_user VALUES (5, 'tess', 'tess@gmail.com', 'path/to/photo.jpg');
INSERT INTO a_user VALUES (6, 'tris', 'tris@gmail.com', 'path/to/photo.jpg');
INSERT INTO a_user VALUES (7, 'tosh', 'tosh@gmail.com', 'path/to/photo.jpg');
INSERT INTO a_user VALUES (8, 'til', 'til@gmail.com', 'path/to/photo.jpg');
INSERT INTO a_user VALUES (9, 'tammy', 'tammy@gmail.com', 'path/to/photo.jpg');
INSERT INTO a_user VALUES (10, 'tab', 'tab@gmail.com', 'path/to/photo.jpg');
INSERT INTO a_user VALUES (11, 'trib', 'trib@gmail.com', 'path/to/photo.jpg');
INSERT INTO a_user VALUES (12, 'trab', 'trab@gmail.com', 'path/to/photo.jpg');


CREATE TABLE players ( name TEXT,
                       id SERIAL,
                       user_id INTEGER REFERENCES a_user (id),
                       placeholder BOOLEAN,
                       PRIMARY KEY (id) );

CREATE TABLE matches ( winner INTEGER REFERENCES players (id),
					   loser INTEGER REFERENCES players (id) );


-- show how each player is doing sorted by number of games played and wins
CREATE VIEW standings AS
    SELECT
        player_wins.id,
        player_wins.name,
        SUM(player_wins.wins) AS wins,
        SUM(player_loses.loses)+SUM(player_wins.wins) AS totalplayed,
        player_wins.user_id,
        player_wins.placeholder
    FROM
    	-- add up wins for each player (players may appear twice)
        (
        SELECT
            players.id, players.name, COUNT(matches.winner) AS wins, players.user_id, players.placeholder
        FROM
            players
        LEFT JOIN
        	matches
        ON players.id = matches.winner
        GROUP BY players.id, players.name
        )
        AS player_wins
    LEFT JOIN
    	-- add up loses for each player
        (
        SELECT
            players.id, COUNT(matches.loser) AS loses
        FROM
            players
        LEFT JOIN
            matches
        ON players.id = matches.loser
        GROUP BY players.id
        )
        AS player_loses
    ON player_wins.id = player_loses.id
    GROUP BY player_wins.id, player_wins.name, player_wins.user_id, player_wins.placeholder
    ORDER BY SUM(player_wins.wins), player_wins.user_id DESC;



-- inject row count into the standings table
CREATE VIEW enumerated_standings AS
	SELECT
		ROW_NUMBER() OVER(),
		*
	FROM
		standings;

-- standings from rows 2, 4, 6, 8, etc in the standings view
CREATE VIEW even_standings AS
	SELECT
		ROW_NUMBER() OVER() even_row_number,
		*
	FROM
		enumerated_standings
	WHERE
		(enumerated_standings.row_number % 2) = 0;

-- standings from rows 1, 3, 5, 7, etc in the standings view
CREATE VIEW odd_standings AS
	SELECT
		ROW_NUMBER() OVER() odd_row_number,
		*
	FROM
		enumerated_standings
	WHERE
		(enumerated_standings.row_number % 2) = 1;

-- create match ups with players who have the most simular win records
CREATE VIEW pairup AS

	SELECT
		standings_a.id id1,
        standings_a.name name1,
		standings_b.id id2,
        standings_b.name name2,
        standings_a.user_id user_id
	FROM
		odd_standings standings_a, even_standings standings_b
	WHERE
		-- each adjacent row from standings becomes a match
		standings_a.odd_row_number = standings_b.even_row_number







