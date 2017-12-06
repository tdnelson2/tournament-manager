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

	StandingsView: function(standingsData, roundIsInProgress, modalID, overallChampion, mainView) {
		var self = this;
		self.modalID = modalID;
		self.standingsData = standingsData;
		self.roundIsInProgress = roundIsInProgress;
	    self.overallChampion = overallChampion;
	    self.mainView = mainView;

		self.finish = function() {
		  if(self.overallChampion === undefined) {
		    self.mainView.showNextViewAfterStandings();
		  } else {
		    self.mainView.markTournamentComplete();
		  }
		};

		$('#standingsModal').on('hide.bs.modal', function(e) {
		  if(!self.roundIsInProgress) {
		  	NOTIFIER.notifySubscribers('', "hideAllExceptDashboard");
		  }
		});

		$('#'+self.modalID).modal('show');
	},

	EditView: function(src, modalID, serverKey, mainView) {
		var self = this;
		self.src = src;
		self.modalID = modalID;
		self.serverKey = serverKey;
		self.items = ko.observableArray([]);
		self.mainView = mainView;


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
	      		newNames: newNames
	      	};
			self.mainView.postItemNamesUpdate(data);
	      }
		};

	    for (var i = 0; i < self.src().length; i++) {
	      self.items.push({ name: ko.observable( self.src()[i].name() ) });
	    }

		$('#'+self.modalID).modal('show');
	},

	DeleteView: function(src, modalID, serverKey, mainView) {
		var self = this;
		self.items = src;
		self.serverKey = serverKey;
		self.mainView = mainView;

		self.finish = function() {
			self.mainView.deleteItems(self.serverKey);
		};

		$('#'+modalID).modal('show');
	}
};