var NextRoundView = {

    modalHTML: ''+
      '<!-- Modal -->'+
      '<div class="modal fade" id="nextModal" role="dialog">'+
        '<div class="modal-dialog">'+
          '<!-- Modal content-->'+
          '<div class="modal-content">'+
            '<div class="modal-header">'+
              // '<button type="button" class="close" data-dismiss="modal">&times;</button>'+
              '<button class="btn btn-primary btn-lg btn-block" data-bind="click: dismiss">Next Round</button>'+
              '<button class="btn btn-secondary btn-lg btn-block" data-bind="click: next">Stay Here</button>'+
            '</div>'+
          '</div>'+
        '</div>'+
      '</div>',

      populate: function(progress){
        // Insert into DOM
        var $next = document.getElementById('next-round');
        $next.innerHTML = '';
        $next.innerHTML = '<div id="next-bindings"></div>';
        var $bindings = document.getElementById('next-bindings');
        $bindings.innerHTML = NextRoundView.modalHTML;

        $('#nextModal').modal('show');

        // Init binding
        ko.applyBindings( new NextRoundView.View(progress), $bindings );
      },

      View: function(progress) {
        var self = this;

        self.dismiss = function() {
          console.log('dismiss clicked');
        };

        self.next = function() {
          console.log('next clicked');
        };
      }
}