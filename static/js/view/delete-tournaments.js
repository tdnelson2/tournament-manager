var DeleteTournamentsView = {
	html: ''+
	    '<div class="form-check" data-bind="foreach: items">'+
	        '<label class="form-check-label" style="display:block;">'+
	          '<input type="checkbox" class="form-check-input" data-bind="checked: isSlatedToDelete">'+
	          '<!--ko text: name--><!--/ko-->'+
	        '</label>'+
	    '</div>',

	populate: function(tournaments) {

		var html = OptionsModal.html.slice()
				   .replace(/%MODAL-TITLE%/g, 'Delete Tournaments')
				   .replace(/%MODAL-ID%/g, 'deleteTournaments')
				   .replace(/%MODAL-BODY%/g, DeleteTournamentsView.html)
				   .replace(/%MODAL-FINISH-BTN%/g, 'Delete');

	    // Add HTML to the DOM and init the view model
	    var $bindings = utilities.addToDOM('delete-tournaments', html);

	    ko.applyBindings( new DeleteTournamentsView.View(tournaments), $bindings );
	},

	View: function(tournaments) {
		var self = this;
		self.items = tournaments;

		self.finish = function() {
			NOTIFIER.notifySubscribers('', "deleteTournaments");
		};

		$('#deleteTournaments').modal('show');
	}
}