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
                '<button type="button" class="btn btn-secondary" data-dismiss="modal">%MODAL-CLOSE-BTN%</button>'+
                '<button type="button" class="btn btn-primary" data-dismiss="modal" data-bind="click: finish">%MODAL-FINISH-BTN%</button>'+
              '</div>'+
            '</form>'+
          '</div>'+
        '</div>'+
      '</div>',

  field: ''+
      '<div class="form-group" data-bind="foreach: items">'+
          '<input type="text" class="form-control" style="margin-bottom:15px;" data-bind="value: name">'+
      '</div>',

  checkbox: ''+
      '<div class="form-check" data-bind="foreach: items">'+
          '<label class="form-check-label" style="display:block;">'+
            '<input type="checkbox" class="form-check-input" data-bind="checked: isSlatedToDelete">'+
            '<!--ko text: name--><!--/ko-->'+
          '</label>'+
      '</div>'
};