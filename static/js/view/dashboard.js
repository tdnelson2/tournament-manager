
var DashboardView = {

    html: ''+
            '<div class="categories" data-bind="visible: shouldShowDashboard">'+
                '<div class="category-text">'+
                    '<h3 style="display:inline;">My Tournaments </h3>'+
                    '%SETTINGS-MENU%'+
                '</div>'+

                '<div class="bs-container-fluid-modified bs-container-modified">'+
                    '<div class="content">'+
                        '<div class="row">'+

                            '<div class="col-xs-12 col-sm-6 col-md-6 col-lg-4 head-room">'+
                                '<div class="add-circle center" data-bind="click: createTournament">'+
                                    '<h3 class="circle-text">Create New Tournament</h3>'+
                                '</div>'+
                            '</div>'+

                            '<!-- ko foreach: tournaments -->'+

                            '<div class="col-xs-12 col-sm-6 col-md-6 col-lg-4 head-room">'+
                                '<div data-bind="css: { \'details-shown\' : isSelected }, event: { mouseover: $root.enableDetails, mouseout: $root.disableDetails }" class="btn-group btn-group-sm delete-tournament" role="group" aria-label="Delete">'+
                                    '<button type="button" class="btn btn-outline-secondary" data-bind="click: $root.promptForDelete"><i class="fa fa-trash-o fa-lg" style="color:#212529;" aria-hidden="true"></i></button>'+
                                '</div>'+
                                '<div class="circle center" data-bind="click: $root.openTournament, event: { mouseover: $root.enableDetails, mouseout: $root.disableDetails }">'+
                                    '<h3 class="circle-text" data-bind="text: name"></h3>'+
                                '</div>'+
                            '</div>'+

                            '<!-- /ko -->'+

                        '</div>'+
                    '</div>'+
                '</div>'+
            '</div> <!-- /categories -->',

        populate: function(tournaments, mainView) {

            // Add HTML to the DOM and init the view model
            var dropdown = DropDownMenu.prepare([
                {itemText:' Create New Tournament ...', action:'createTournament', css:'fa fa-plus fa-fw'},
                {itemText:' Delete Tournament(s) ...', action:'deleteTournaments', css:'fa fa-trash-o fa-fw'},
                {itemText:' Edit Tournament Name(s) ...', action:'editTournaments', css:'fa fa-edit fa-fw'}]);

            var html = DashboardView.html.slice().replace('%SETTINGS-MENU%', dropdown);
            var $bindings = utilities.addToDOM('dashboard', html);

            ko.applyBindings( new DashboardView.View(tournaments, mainView), $bindings );
        },

        View: function(tournaments, mainView) {
            var self = this;
            self.tournaments = tournaments;
            self.mainView = mainView;
            self.shouldShowDashboard = ko.observable(true);

            self.enableDetails = function(thisTournament) {
                thisTournament.isSelected(true);
            };

            self.disableDetails = function(thisTournament) {
                thisTournament.isSelected(false);
            };

            self.promptForDelete = function(thisTournament) {
                self.mainView.promptForTournamentDelete(thisTournament);
            };

            self.openTournament = function(tournament) {
                console.log(tournament.id);
                console.log('openTournament');
                self.mainView.showTournament(tournament);
                self.shouldShowDashboard(false);
            };

            self.createTournament = function() {
                console.log('create new tournament');
                self.mainView.createTournament();
            };

            self.editTournaments = function() {
                self.mainView.showEditTournamentsModal()
            };

            self.deleteTournaments = function() {
                self.mainView.showDeleteTournamentsModal();
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
};