(function($){
	$.fn.accordion = function(options) {
	
		var defaults = 
		{
			
		};
	
		var options = $.extend(defaults, options);
	
		return this.each( function() 
		{		
			var $container = $(this);
			var $triggers = $container.find ('.accordion_panel');
			var $panels = $container.find ('.accordion_content');
			
			
			$panels.hide ();			
			$triggers.eq (0).addClass ('active').next ().show ();			
			
			// Set min-height to prevent content from jumping as much
			$container.css ('min-height' , $container.height ()  + 10 + 'px');
			
			$triggers.live ('click' , function () 
			{
				if ( $(this).next ().is (':hidden') )
				{
					$triggers.removeClass ('active').next ().slideUp ();
					$(this).toggleClass ('active').next ().slideDown ();
				}					
				return false;
			});
		});		
	};

})(jQuery);


(function($){
	$.fn.tabs = function(options) {
	
		var defaults = 
		{
			
		};
	
		var options = $.extend(defaults, options);
	
		return this.each( function() {
	   		
			var $tabContainer = $(this);
			var $tabLi = $tabContainer.find ('.tabs li');
			var $tabContent = $tabContainer.find ('.tab_content');
			
			$tabContent.hide ();
			$tabLi.eq (0).addClass ('active').show ();
			$tabContent.eq (0).show ();
			
			$tabLi.live ('click' , function () 
			{
				var activeTab = $(this).find ('a').attr ('href');
				
				$tabLi.removeClass("active");
				$(this).addClass("active");
				$tabContent.hide ();
				
				$tabContainer.find (activeTab).fadeIn ('slow');
				return false;
			});	
		});		
	};

})(jQuery);


(function($) {
    $.fn.PhotoGallery = function(options) {
        var defaults = {};
        var options = $.extend(defaults, options);
        return this.each(function() {
            var galleryContainer = $(this);

            galleryContainer.find('a.delete').bind('click', function() {
                var deleteAnchor = $(this);
                $.ajax({ type: "POST", url: deleteAnchor.attr('href'),
                    success: function (response) {
                        if (response.Success) {
                            deleteAnchor.closest('li').remove();
                        }
                    }
                });
                return false;
            });

            galleryContainer.find('a.add').each(function () {
                var addAnchor = $(this);
                upclick({
                    element: addAnchor[0],
                    action: addAnchor.attr('href'),
                    dataname: 'imageData',
                    oncomplete: function(response) {
                        galleryContainer.find('.LoadingPhoto').hide();
                        galleryContainer.find('.ReadyToLoadPhoto').show();
                        var galleryContent = $(response).find('.gallery');
                        galleryContainer.replaceWith(galleryContent);
                        galleryContent.PhotoGallery();
                        galleryContent.trigger('ContentAdded');
                    },
                    onstart: function() { 
                        galleryContainer.find('.ReadyToLoadPhoto').hide();
                        galleryContainer.find('.LoadingPhoto').show();
                    }
                });
                return false;
            });

        });
    };
})(jQuery);


(function ($) {
    $.fn.CoordinatePicker = function(options) {
        var defaults = {};
        var options = $.extend(defaults, options);
        return this.each(function () {
            var pickerContainer = $(this);
            pickerContainer.find('button').show();
            var coordinateContainer = pickerContainer.find('input[type=text]');

            pickerContainer.bind('PickCoordinates', function (event, mapLoader) {
                var coordinates = Coordinates.Parse(coordinateContainer.val());
                CoordinatePicker.Open({}, function() { alert('callback'); });
                return false;
            });
        });
    };
})(jQuery);
