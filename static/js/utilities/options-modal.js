var OptionsModal = {
	html: ''+
      '<!-- Modal -->'+
      '<div class="modal fade" id="%MODAL-ID%" tabindex="-1" role="dialog" aria-labelledby="exampleModalLabel" aria-hidden="true">'+
        '<div class="modal-dialog" role="document">'+
          '<div class="modal-content">'+
            '<div class="modal-header">'+
              '<h5 class="modal-title" id="exampleModalLabel">%MODAL-TITLE%</h5>'+
              '<button type="button" class="close" data-dismiss="modal" aria-label="Close">'+
                '<span aria-hidden="true">&times;</span>'+
              '</button>'+
            '</div>'+
            '<form>'+
              '<div class="modal-body">'+
              '%MODAL-BODY%'+
              '</div>'+
              '<div class="modal-footer">'+
                '<button type="button" class="btn btn-secondary" data-dismiss="modal">Close</button>'+
                '<button type="button" class="btn btn-primary" data-dismiss="modal" data-bind="click: finish">%MODAL-FINISH-BTN%</button>'+
              '</div>'+
            '</form>'+
          '</div>'+
        '</div>'+
      '</div>'
};