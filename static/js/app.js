// Pub/Sub for upstream communication with MainViewModel
var NOTIFIER = new ko.subscribable();


// Determine if toolbar should be shown on load.
var SHOW_TOOLBAR = true;
if($( window ).width() < 768) {
	SHOW_TOOLBAR = false;
}

RoundStatus = {
	FIRST_ROUND: 1,
	NOT_FIRST_ROUND: 2,
	FINAL_ROUND: 3
}

 // document.getElementById('sidebar-wrapper')

ko.applyBindings(new MainViewModel(SHOW_TOOLBAR), document.getElementById('sidebar-wrapper'));