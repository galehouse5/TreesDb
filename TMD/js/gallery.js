var gallery = new function () {
    var public = {};

    public.init = function () {
        $('.gallery a.delete').live('click', function (event) {
            var anchor = $(this);
            $.ajax({ type: "POST", url: anchor.attr('href'),
                success: function (response) {
                    if (response.Success) {
                        anchor.closest('li').remove();
                    }
                }
            });
            event.preventDefault();
        });
    }

    return public;
};