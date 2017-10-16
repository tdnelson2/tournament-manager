var Model = {

	Player: function(data) {
		this.id = data.id;
		this.name = ko.observable(data.name);
		this.wins = ko.observable(data.wins);
		this.matches = ko.observable(data.matches);
		this.isSelected = ko.observable(false);
	},

	Progress: function(data) {
		var self = this;

		self.total_matches = ko.observable(data.total_matches);
		self.match_count = ko.observable(data.match_count);
		self.player_count = ko.observable(data.player_count);
		self.total_rounds = ko.observable(data.total_rounds);
		self.this_round = ko.observable(data.this_round);

		self.update = function(data) {
	      self.total_matches(data.total_matches);
	      self.match_count(data.match_count);
	      self.player_count(data.player_count);
	      self.total_rounds(data.total_rounds);
	      self.this_round(data.this_round);
		};
	},

	serialize: function(player) {
		jplayer = {
			id: player.id,
			name: player.name(),
			wins: player.wins(),
			matches: player.matches()
		}

		return JSON.stringify(jplayer);
	}
};