// Pub/Sub for upstream communication with MainViewModel
var NOTIFIER = new ko.subscribable();

var GUEST_MODE = utilities.isGuestMode();
console.log('isGuestMode: '+GUEST_MODE);

// Determine if toolbar should be shown on load.
var SHOW_TOOLBAR = true;
if($( window ).width() < 768) {
	SHOW_TOOLBAR = false;
}

var RoundStatus = {
	FIRST_ROUND: 1,
	NOT_FIRST_ROUND: 2,
	FINAL_ROUND: 3
}

var ItemType = {
	TOURNAMENT: 1,
	PLAYER: 2,
}

 // document.getElementById('sidebar-wrapper')

ko.applyBindings(new MainViewModel(SHOW_TOOLBAR), document.getElementById('sidebar-wrapper'));