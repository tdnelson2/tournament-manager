// Pub/Sub for upstream communication with MainViewModel
var NOTIFIER = new ko.subscribable();

RoundStatus = {
	FIRST_ROUND: 1,
	NOT_FIRST_ROUND: 2,
	FINAL_ROUND: 3
}

ko.applyBindings(new MainViewModel());