var DropDownMenu = {
	html: ''+
        '<div class="dropdown show" style="display:inline;">'+
          '<a style="position:absolute;bottom:2px;left:5px;" href="#" id="dropdownMenuLink" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">'+
              '<i class="fa fa-chevron-down fa-fw" style="font-size:12pt;color:gray;" aria-hidden="true"></i>'+
          '</a>'+
          '<div class="dropdown-menu" aria-labelledby="dropdownMenuLink">'+
          '%ITEMS%'+
          '</div>'+
        '</div>',

    item: '<a class="dropdown-item" href="#" data-bind="click: %ACTION%"><i class="%CSS%" aria-hidden="true"></i>%ITEM-NAME%</a>',

    prepare: function(items) {
    	// `items` is an array of objects each of which contains `itemText`, `action`, `css`.

    	var htmlItems = '';

    	for (var i = 0; i < items.length; i++) {
    		var x = items[i];
	    	var item = DropDownMenu.item.slice()
	    					.replace('%ACTION%', x.action)
	    					.replace('%CSS%', x.css)
	    					.replace('%ITEM-NAME%', x.itemText);
	    	var htmlItems = htmlItems+item;
    	}

    	return DropDownMenu.html.slice().replace('%ITEMS%', htmlItems);
    }
};
