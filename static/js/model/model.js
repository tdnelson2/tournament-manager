var Model = {
	Players : [
		{
			name: 'Blue Baracudas',
			wins: 0,
			totalPlayed: 0 
		},
		{
			name: 'Red Jaguars',
			wins: 0,
			totalPlayed: 0 
		},
		{
			name: 'Silver Snakes',
			wins: 0,
			totalPlayed: 0 
		},
		{
			name: 'Purple Parrots',
			wins: 0,
			totalPlayed: 0 
		},
		{
			name: 'Yellow Yams',
			wins: 0,
			totalPlayed: 0 
		},
		{
			name: 'Orange Orangutans',
			wins: 0,
			totalPlayed: 0 
		},
	],

	Player: function(data) {
		this.name = ko.observable(data.name);
		this.wins = ko.observable(data.wins);
		this.totalPlayed = ko.observable(data.totalPlayed);
	},

	serialize: function(player) {
		jplayer = {
			name: player.name(),
			wins: player.wins(),
			totalPlayed: player.totalPlayed()
		}
		
		return JSON.stringify(jplayer);
	}
};