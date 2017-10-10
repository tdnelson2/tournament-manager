// Pub/Sub for upstream communication with MainViewModel
var NOTIFIER = new ko.subscribable();

ko.applyBindings(new MainViewModel());