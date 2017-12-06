// Pub/Sub for upstream communication with MainViewModel
var NOTIFIER = new ko.subscribable();

var GUEST_MODE = utilities.isGuestMode();
console.log('isGuestMode: '+GUEST_MODE);

var RoundStatus = {
	FIRST_ROUND: 1,
	NOT_FIRST_ROUND: 2,
	FINAL_ROUND: 3
}

var ItemType = {
	TOURNAMENT: 1,
	PLAYER: 2,
}

ko.applyBindings(new MainViewModel(), document.getElementById('sidebar-wrapper'));