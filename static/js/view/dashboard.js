

var DashboardView = {
    html: ''+
            '<div class="categories" data-bind="visible: shouldShowDashboard">'+
                '<h3 class="category-text">Current Tournaments</h3>'+
                '<div class="bs-container-fluid-modified bs-container-modified">'+
                    '<div class="content">'+
                        '<div class="row" data-bind="foreach: tournaments">'+
                            '<div class="col-xs-12 col-sm-6 col-md-6 col-lg-4 head-room">'+
                                '<div class="circle center" data-bind="css: { circle : id !== 0, \'add-circle\' : id === 0 }, click: $root.openTournament">'+
                                    '<h3 class="circle-text" data-bind="text: name"></h3>'+
                                '</div>'+
                            '</div>'+
                        '</div>'+
                    '</div>'+
                '</div>'+
            '</div> <!-- /categories -->',

        populate: function(tournaments) {

            // Add HTML to the DOM and init the view model
            var $bindings = utilities.addToDOM('dashboard', DashboardView.html);

            ko.applyBindings( new DashboardView.View(tournaments), $bindings );
        },

        View: function(tournaments) {
            var self = this;
            self.tournaments = tournaments;
            self.shouldShowDashboard = ko.observable(true);

            self.openTournament = function(tournament) {
                console.log(tournament.id);
                if(tournament.id === 0) {
                    console.log('create new tournament')
                    NOTIFIER.notifySubscribers('', "createTournament");
                } else {
                    console.log('openTournament');
                    NOTIFIER.notifySubscribers(tournament.id, "showTournament");
                    self.shouldShowDashboard(false);
                }
            }

            NOTIFIER.subscribe(function() {
                console.log('show dashboard view');
                self.shouldShowDashboard(true);
            }, self, "showDashboard");

            NOTIFIER.subscribe(function() {
                console.log('hide dashboard view');
                self.shouldShowDashboard(false);
            }, self, "hideDashboard");

            NOTIFIER.subscribe(function(tournament_id) {
                self.shouldShowDashboard(true);
            }, self, "hideAllExceptDashboard");
        }
}