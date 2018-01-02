var LoadingView = {
	View: function() {
		var self = this;
        self.shouldShowLoader = ko.observable(false);

        NOTIFIER.subscribe(function() {
            self.shouldShowLoader(true);
        }, self, "showLoader");

        NOTIFIER.subscribe(function() {
            self.shouldShowLoader(false);
        }, self, "hideLoader");
	}
}