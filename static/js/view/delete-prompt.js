

var DeletePrompt = {

	populate : function(item, itemType) {

	    var html = ModalPrompt.html.slice().replace(/%MODAL-ID%/g, 'deleteItem');

	    // Add HTML to the DOM and init the view model
	    var $bindings = utilities.addToDOM('delete-prompt', html);

		$('#deleteItem').on('shown.bs.modal', function () {
		    $('#deleteItemSecondary').focus();
		});

	    ko.applyBindings( new DeletePrompt.View(item, itemType), $bindings );
	},

	View: function(item, itemType) {

		var self = this;
		self.item = item;
		self.itemType = itemType;

	    self.primaryText = ko.pureComputed(function(){
	        return 'Delete \''+self.item.name()+'\'';
	    });

	    self.primaryAction = function() {
	    	if (self.itemType === ItemType.TOURNAMENT) {
	    		item.isSlatedToDelete(true);
				NOTIFIER.notifySubscribers('', "deleteTournaments");
			}
			else if (self.itemType === ItemType.PLAYER) {
				NOTIFIER.notifySubscribers('', "deletePlayers");
			}
	    };

	    self.secondaryText = ko.pureComputed(function(){
	      return 'Don\'t Delete!'
	    });

	    self.secondaryAction = function(){ return; };

		$('#deleteItem').modal('show');

	}
}