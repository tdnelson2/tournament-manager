
 //  
var DashboardView = {
    html: ''+
            '<div class="categories" data-bind="visible: shouldShowDashboard">'+
                '<div class="category-text">'+
                    '<h3 style="display:inline;">My Tournaments </h3>'+
                    '<div class="dropdown show" style="display:inline;">'+
                      '<a style="position:absolute;bottom:2px;left:5px;" href="#" id="dropdownMenuLink" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">'+
                          '<i class="fa fa-chevron-down fa-fw" style="font-size:12pt;color:gray;" aria-hidden="true"></i>'+
                      '</a>'+
                      '<div class="dropdown-menu" aria-labelledby="dropdownMenuLink">'+
                        '<a class="dropdown-item" href="#" data-bind="click: createTournament"><i class="fa fa-plus fa-fw" aria-hidden="true"></i> Create New Tournament ...</a>'+
                        '<a class="dropdown-item" href="#" data-bind="click: deleteTournaments"><i class="fa fa-trash-o fa-fw" aria-hidden="true"></i> Delete Tournament(s) ...</a>'+
                        '<a class="dropdown-item" href="#"><i class="fa fa-edit fa-fw" aria-hidden="true"></i> Edit Tournament ...</a>'+
                      '</div>'+
                    '</div>'+
                '</div>'+
                '<div class="bs-container-fluid-modified bs-container-modified">'+
                    '<div class="content">'+
                        '<div class="row" data-bind="foreach: tournaments">'+
                            '<div class="col-xs-12 col-sm-6 col-md-6 col-lg-4 head-room">'+
                                '<!-- ko if: id !== 0 -->'+
                                '<div data-bind="css: { \'details-shown\' : isSelected }, event: { mouseover: $root.enableDetails, mouseout: $root.disableDetails }" class="btn-group btn-group-sm delete-tournament" role="group" aria-label="Delete">'+
                                    '<button type="button" class="btn btn-outline-secondary" data-bind="click: $root.promptForDelete"><i class="fa fa-trash-o fa-lg" style="color:#212529;" aria-hidden="true"></i></button>'+
                                '</div>'+
                                '<!-- /ko -->'+
                                '<div class="circle center" data-bind="css: { circle : id !== 0, \'add-circle\' : id === 0 }, click: $root.openTournament, event: { mouseover: $root.enableDetails, mouseout: $root.disableDetails }">'+
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

            self.enableDetails = function(thisTournament) {
                thisTournament.isSelected(true);
            };

            self.disableDetails = function(thisTournament) {
                thisTournament.isSelected(false);
            };

            self.promptForDelete = function(thisTournament) {
                NOTIFIER.notifySubscribers(thisTournament, "promptForTournamentDelete");
            };

            self.openTournament = function(tournament) {
                console.log(tournament.id);
                if(tournament.id === 0) {
                    self.createTournament();
                } else {
                    console.log('openTournament');
                    NOTIFIER.notifySubscribers(tournament.id, "showTournament");
                    self.shouldShowDashboard(false);
                }
            };

            self.createTournament = function() {
                console.log('create new tournament')
                NOTIFIER.notifySubscribers('', "createTournament");
            };

            self.deleteTournaments = function() {
                DeleteTournamentsView.populate(tournaments);
            };

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