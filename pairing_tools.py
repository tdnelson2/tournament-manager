
import math

def pairup(standings, match_history, tournament_name):
    """Pair up players using the swiss system

    Each player is paired with another play who has either
    the same or simular win/lose record

    Args:
      standings: an array of arrays
        [id, name, wins, matches, tournament_id, is_placeholder]

    Returns:
      An array of dictionaries {id1, name1, id2, name2, user_id}
        id1: 1st player's unique id
        name1: 1st player's name
        id2: 2nd player's unique id
        name2: 2nd player's name
        tournamentName: name given to the tournament
    """

    i = 0
    pairs = []
    current_pair = []
    while i < len(standings):
        current_pair.append(standings[i][0])
        current_pair.append(standings[i][1])

        if i%2 == 1:
            pairs.append(current_pair)
            current_pair = []
        i +=1

    unique_pairs = fixDuplicates(pairs, match_history)
    pair_dicts = [dict(id1=a,name1=b,id2=c,name2=d) for a,b,c,d in unique_pairs]
    return dict(pairs=pair_dicts, tournamentName=tournament_name)



def fixDuplicates(pairs, match_history):
	"""Returns a list of pairs, re-pairing previously played matches.

	In the relatively rare situation where pairs from a previous round
	reemerge in a subsequent pairing, this function will re-match the players
	by swaping one player in the closest neighboring unique match.

    Args:
      pairs: array of arrays containing
        [id1, name1, id2, name2]

	Returns:
	  A list of tuples, each of which contains (id1, name1, id2, name2)
	    id1: 1st player's unique id
	    name1: 1st player's name
	    id2: 2nd player's unique id
	    name2: 2nd player's name
	"""
	i = 0
	while i < len(pairs):
		x = pairs[i]
		duplicate = findDuplicate((x[0], x[2]), match_history)
		if duplicate:
			print '\n'+str(duplicate)+' has been played at index: '+str(i)
			maxLst = pairs[i+1:]
			minLst = list(reversed(pairs[:i]))

			# Build a list of possible pairs for which we could swap
			swaps = alternatingList(maxLst, minLst)

			# Loop through the closest neighbors until a unique match is found.
			for p in swaps:
				origin = (pairs[i][0], p[2])
				target = (p[0], pairs[i][2])
				if ( not findDuplicate(origin, match_history) and
					 not findDuplicate(target, match_history) ):
					full_origin = (pairs[i][0], pairs[i][1], p[2], p[3])
					full_target = (p[0], p[1], pairs[i][2], pairs[i][3])
					replaceListItem(x, full_origin, pairs)
					replaceListItem(p, full_target, pairs)
					break
		i += 1
	return pairs


# Helper functions

def alternatingList(list1, list2):
	# Combines 2 lists in an alternating fasion
	if len(list1) < len(list2):
		smaller = list1
		larger = list2
	else:
		smaller = list2
		larger = list1
	isEqual = False
	if len(list1) == len(list2):
		isEqual = True

	# https://stackoverflow.com/questions/3678869/pythonic-way-to-combine-two-lists-in-an-alternating-fashion
	alt = [None]*(len(smaller)*2)

	# Add the smaller list at even indexes
	alt[1::2] = smaller

	# If the 2 lists are not equal, we need to add more placeholder items.
	if not isEqual:
		adtlIndexes = (len(larger*2))-(len(smaller*2))
		alt = alt+[None]*adtlIndexes

	# Add the larger list at odd indexes
	alt[::2] = larger
	alt = filter(lambda a: a != None, alt)
	return alt

def findDuplicate(pair, pair_array):
	if pair in pair_array:
		return pair
	reverse_pair = (pair[1], pair[0])
	if reverse_pair in pair_array:
		return reverse_pair
	return None

def replaceListItem(original_item, replacement_item, array):
	array[array.index(original_item)] = replacement_item



def calculateProgress(player_count, match_count):
    """Returns data on tournament progress including number of rounds,
    which round we're currently in, and number of matches.

    Returns:
      `total_matches`: number of matches to crown a champion.
      `match_count`: current number of matches played.
      `player_count`: total number of players.
      `total_rounds`: number of rounds to crown a champion.
      `this_round`: current round being played.
    """

    # Determine number of rounds expected to find a winner.
    print 'match_count: '+str(match_count)
    print 'player_count: '+str(player_count)
    if player_count < 2:
        return dict(player_count=player_count,
                    match_count=match_count,
                    total_matches=0,
                    total_rounds=0,
                    this_round=0)
    total_rounds = int(round(math.log(player_count,2)))

    total_matches = (player_count/2) * total_rounds
    this_round = int((float(match_count)/float(total_matches))*float(total_rounds))+1

    return dict(player_count=player_count,
                match_count=match_count,
                total_matches=total_matches,
                total_rounds=total_rounds,
                this_round=this_round)