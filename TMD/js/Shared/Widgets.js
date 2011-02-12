(function ($) {
    $.fn.SmoothScrollInFocus = function (options) {
        var defaults = { duration: 400 };
        var options = $.extend(defaults, options);
        return this.each(function () {
            $('html, body').animate({
                scrollTop: $(this).offset().top 
                }, 
                options.duration);
        });
    }
})(jQuery);

(function ($) {
    $.fn.InitializeUi = function (options) {
        return this.each(function () {
            $(this).find('.RequiresJavascript')
                .not('.UiInitialized').addClass('UiInitialized').show();
            $(this).find('.LacksJavascript')
                .not('.UiInitialized').addClass('UiInitialized').hide();
            $(this).find("select, input:checkbox, input:radio, input:file")
                .not('.UiInitialized').addClass('UiInitialized').uniform();
            $(this).find("*[rel=facebox]")
                .not('.UiInitialized').addClass('UiInitialized').facebox();
            $(this).find("*[rel=tooltip]")
                .not('.UiInitialized').addClass('UiInitialized').tipsy({ gravity: 's' });
            $(this).find('input[type=text].DatePicker')
                .not('.UiInitialized').addClass('UiInitialized').datepicker({
                    showOn: 'button',
                    buttonImage: '/images/icons/Calendar.gif',
                    duration: 0
                });
        });
    }
})(jQuery);


(function ($) {
    $.fn.PhotoGallery = function (options) {
        var defaults = {};
        var options = $.extend(defaults, options);
        return this.each(function () {
            var $galleryContainer = $(this);
            $galleryContainer.find("*[rel=facebox]")
                .not('.UiInitialized').addClass('UiInitialized').facebox();

            $galleryContainer.find('a.Remove').bind('click', function () {
                var $deleteAnchor = $(this);
                $.ajax({ type: "POST", url: $deleteAnchor.attr('href'),
                    success: function (response) {
                        if (response.Success) {
                            $deleteAnchor.closest('li').remove();
                        }
                    }
                });
                return false;
            });

            $galleryContainer.find('a.Add').each(function () {
                var $addAnchor = $(this);
                upclick({
                    element: $addAnchor[0],
                    action: $addAnchor.attr('href'),
                    dataname: 'imageData',
                    oncomplete: function (response) {
                        $galleryContainer.find('.LoadingPhoto').hide();
                        $galleryContainer.find('.ReadyToLoadPhoto').show();
                        var $galleryContent = $(response);
                        $galleryContainer.replaceWith($galleryContent);
                        $galleryContent.addClass('Initialized').PhotoGallery();
                    },
                    onstart: function () {
                        $galleryContainer.find('.ReadyToLoadPhoto').hide();
                        $galleryContainer.find('.LoadingPhoto').show();
                    }
                });
                return false;
            });

        });
    };
})(jQuery);
