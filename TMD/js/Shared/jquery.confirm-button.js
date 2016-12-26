(function ($) {
  $.fn.confirmButton = function () {
    return this.each(function () {
      var $button = $(this);
      var confirmText = $button.data('confirm-text');
      var confirmClass = $button.data('confirm-class');

      var confirm = function (event) {
        event.preventDefault();
        $button.text(confirmText);
        $button.attr('class', confirmClass);
        $button.unbind('click', confirm);
      };

      $button.bind('click', confirm);
    });
  }

  $('[data-confirm-button]').confirmButton();
})(jQuery);