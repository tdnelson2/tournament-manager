

def fixDuplicates(pairs, match_history):
	"""Returns a list of pairs, re-pairing previously played matches.

	In the relatively rare situation where pairs from a previous round
	reemerge in a subsequent pairing, this function will re-match the players
	by swaping one player in the closest neighboring unique match.

    Args:
      name: the player's full name (need not be unique).

	Returns:
	  A list of tuples, each of which contains {id1, name1, id2, name2, user_id}
	    id1: 1st player's unique id
	    name1: 1st player's name
	    id2: 2nd player's unique id
	    name1: 2nd player's name
	    user_id: user id of of user who owns the tournament
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

			# Loop through the closest neighbors until a unique match if found.
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