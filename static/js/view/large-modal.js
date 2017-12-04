var LargeModalView = {

	populate: function(parameters) {
		/*
		`parameters` is an object with the following keys:
		  `titleTxt`: The text that will appear in the modal's header.
		  `modalID`: The id that will be given to the modal.
		  `bodyHTML`: The html that will appear in the modal's body.
		  `closeBtnTxt`: Text that will appear in the close button.
		  `finishBtnTxt`: Text that will appear in the finish button.
		  `domTargetID`: The id of the element in which the modal will be added.
		*/

		var p = parameters;

		var html = OptionsModal.html.slice()
				   .replace(/%MODAL-TITLE%/g, p.titleTxt)
				   .replace(/%MODAL-ID%/g, p.modalID)
				   .replace(/%MODAL-BODY%/g, p.bodyHTML)
				   .replace(/%MODAL-CLOSE-BTN%/g, p.closeBtnTxt)
				   .replace(/%MODAL-FINISH-BTN%/g, p.finishBtnTxt);

	    // Add HTML to the DOM and init the view model
	    var $bindings = utilities.addToDOM(p.domTargetID, html);

	    return $bindings;
	},

	StandingsView: function(standingsData, modalID, data, tournamentIsComplete) {
		var self = this;
		self.modalID = modalID;
		self.standingsData = standingsData;
	    self.data = data;
	    self.tournamentIsComplete = tournamentIsComplete;

		$('#standingsModal').on('hide.bs.modal', function(e) {
		  if(self.tournamentIsComplete) {
		    console.log('show dashboard');
		    NOTIFIER.notifySubscribers('', "hideAllExceptDashboard");
		  } else {
		    NOTIFIER.notifySubscribers(self.data, "showPairingsView");
		  }
		});

		self.finish = function() {};

		$('#'+self.modalID).modal('show');
	},

	EditView: function(src, modalID, serverKey, tournament) {
		var self = this;
		self.src = src;
		self.modalID = modalID;
		self.serverKey = serverKey;
		self.tournament = tournament;
		self.items = ko.observableArray([]);


		self.finish = function() {
	      var newNames = [];
	      for (var i = 0; i < self.items().length; i++) {
			var n = self.items()[i].name();
			var t = src()[i];
			console.log('new name: '+n);
			console.log('existing: '+t.name());
			if( n !== t.name()) {
			  console.log('new name found');
			  console.log(n);
			  t.name(n);
			  newNames.push([t.id, t.name()]);
			}
	      }

	      if(newNames.length > 0) {
	      	var data = {
	      		serverKey: serverKey,
	      		tournament: self.tournament,
	      		newNames: newNames
	      	};
			NOTIFIER.notifySubscribers(data, 'postItemNamesUpdate');
	      }
		};

	    for (var i = 0; i < self.src().length; i++) {
	      self.items.push({ name: ko.observable( self.src()[i].name() ) });
	    }

		$('#'+self.modalID).modal('show');
	},

	DeleteView: function(src, modalID, itemType, tournament) {
		var self = this;
		self.items = src;
		self.itemType = itemType;
		self.tournament = tournament;

		self.finish = function() {
			console.log(tournament);
			var data = {
				serverKey: self.itemType,
				tournament: self.tournament
			};
			NOTIFIER.notifySubscribers(data, 'deleteItems');
		};

		$('#'+modalID).modal('show');
	}
};