var Model = {

	Player: function(data) {
		this.id = data.id;
		this.name = ko.observable(data.name);
		this.wins = ko.observable(data.wins);
		this.matches = ko.observable(data.matches);
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