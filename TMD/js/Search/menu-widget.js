(function ($) {
    $.widget("custom.search", $.ui.autocomplete, {
        _renderItem: function (ul, item) {
            return $('<li class="search-result ' + item.Category + '"></li>')
                .data('item.autocomplete', item)
                .append('<a><strong>' + item.Subject + '</strong><br>' + item.Description + '</a>')
                .appendTo(ul);
        }
    });

    $.fn.InitializeSearch = function (options) {
        return this.each(function () {
            var $form = $(this);

            var $autocomplete = $form.find('input').search({
                source: $form.attr('action'),
                minLength: 2,
                select: function (event, ui) {
                    window.location = ui.item.Url;
                }
            });
        });
    };

    $('#search > form').InitializeSearch();
})(jQuery);
