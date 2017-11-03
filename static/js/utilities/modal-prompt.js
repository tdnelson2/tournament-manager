

var ModalPrompt = {
    html : ''+
    '<!-- Modal -->'+
    '<div class="modal fade" id="%MODAL-ID%" role="dialog">'+
      '<div class="modal-dialog modal-sm modal-prompt">'+
        '<div class="modal-content">'+
          '<div class="modal-body">'+
            '<div class="container-fluid">'+
              '<form class="text-center">'+
                '<button id="%MODAL-ID%Primary" type="submit" class="btn btn-primary modal-btn" data-dismiss="modal" data-bind="text: primaryText(), click: primaryAction"></button>'+
              '</form>'+
              '<form class="text-center">'+
                '<button id="%MODAL-ID%Secondary" type="button" class="btn btn-secondary modal-btn" data-dismiss="modal" data-bind="text: secondaryText(), click: secondaryAction"></button>'+
              '</form>'+
              '</div>'+
            '</div>'+
        '</div>'+
      '</div>'+
    '</div>'
};