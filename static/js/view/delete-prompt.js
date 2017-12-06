

var DeletePrompt = {

	populate : function(item, serverKey, mainView) {

	    var html = ModalPrompt.html.slice().replace(/%MODAL-ID%/g, 'deleteItem');

	    // Add HTML to the DOM and init the view model
	    var $bindings = utilities.addToDOM('delete-prompt', html);

		$('#deleteItem').on('shown.bs.modal', function () {
		    $('#deleteItemSecondary').focus();
		});

	    ko.applyBindings( new DeletePrompt.View(item, serverKey, mainView), $bindings );
	},

	View: function(item, serverKey, mainView) {

		var self = this;
		self.item = item;
		self.serverKey = serverKey;
		self.mainView = mainView;

	    self.primaryText = ko.pureComputed(function(){
	        return 'Delete \''+self.item.name()+'\'';
	    });

	    self.primaryAction = function() {
    		item.isSlatedToDelete(true);
    		console.log(serverKey);
			self.mainView.deleteItems(self.serverKey);
	    };

	    self.secondaryText = ko.pureComputed(function(){
	      return 'Don\'t Delete!';
	    });

	    self.secondaryAction = function(){ return; };

		$('#deleteItem').modal('show');

	}
};