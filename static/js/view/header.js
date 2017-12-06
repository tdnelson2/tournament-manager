var HeaderView = {
    View: function() {
        this.showDashboard = function() {
            NOTIFIER.notifySubscribers('', "hideAllExceptDashboard");
        };
    }
};