var PairingsView = {
    pairingHTML: ''+
    '<div class="well well-lg inner-well">'+
        '<div class="pair"">'+
            '<div class="list-group player-paired">'+
                '<a href="#" class="list-group-item list-group-item-action category-items" data-bind="click: reportWinner(%KO-PLAYER-1%)">%PLAYER-1%</a>'+
            '</div>'+
            '<div class="paired-spacer"></div>'+
            '<div class="list-group player-paired">'+
                '<a href="#" class="list-group-item list-group-item-action category-items" data-bind="click: reportWinner(%KO-PLAYER-2%)">%PLAYER-2%</a>'+
            '</div>'+
        '</div>'+
    '</div>',

    rowHTML: ''+
    '<div class="row">'+
        '<h4>Matches</h4>'+
        '<i>Click on a player to report winner</i>'+
    '</div>'+
    '<div class="row">'+
        '<div class="well well-lg">'+
            '%PAIRS-HTML%'+
        '</div>'+
    '</div>',

    populate: function() {
        // Add HTML to the DOM and init view
    },

    View: function() {
        // KO object
    }
};