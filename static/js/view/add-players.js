var AddPlayersView : {
    html: ''+
    '<div class="row">'+
        '<form>'+
            '<div class="form-group">'+
                '<label for="title">Add Players</label>'+
                '<input type="text" class="form-control" id="title" placeholder="" data-bind="value: playerInput">'+
                '</div>'+
            '<button type="submit" class="btn btn-primary" data-bind="click: addPlayer">Add</button>'+
        '</form>'+
    '</div>'+
    '<div data-bind="visible: shouldShowPlayersAdded()">'+
        '<div class="row">'+
            '<h4>Players</h4>'+
        '</div>'+
        '<div class="row">'+
            '<div class="well well-lg" data-bind="foreach: players">'+
                '<div class="list-group">'+
                    '<a href="" class="list-group-item list-group-item-action category-items" data-bind="text: name"></a>'+
                '</div>'+
            '</div>'+
        '</div>'+
        '<div class="row">'+
            '<button type="submit" class="btn btn-primary" data-bind="click: pairUp">Pair Up</button>'+
        '</div>'+
    '</div>',

    populate: function() {
        // Add HTML to the DOM and init the view model
    },

    View: function() {
        // KO object
    }
};