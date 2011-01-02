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
            var $galleryContainer = $(this);
            $galleryContainer.find("*[rel=facebox]").not('.Initialized').addClass('Initialized').facebox();

            $galleryContainer.find('a.delete').bind('click', function() {
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

            $galleryContainer.find('a.add').each(function () {
                var $addAnchor = $(this);
                upclick({
                    element: $addAnchor[0],
                    action: $addAnchor.attr('href'),
                    dataname: 'imageData',
                    oncomplete: function(response) {
                        $galleryContainer.find('.LoadingPhoto').hide();
                        $galleryContainer.find('.ReadyToLoadPhoto').show();
                        var $galleryContent = $(response).find('.gallery');
                        $galleryContainer.replaceWith($galleryContent);
                        $galleryContent.addClass('Initialized').PhotoGallery();
                    },
                    onstart: function() { 
                        $galleryContainer.find('.ReadyToLoadPhoto').hide();
                        $galleryContainer.find('.LoadingPhoto').show();
                    }
                });
                return false;
            });

        });
    };
})(jQuery);


(function ($) {
    $.fn.CoordinatePicker = function(options) {
        var defaults = { AddressCalculator: null };
        var options = $.extend(defaults, options);
        return this.each(function () {
            var $pickerContainer = $(this);
            $pickerContainer.find('button').show();
            var $coordinateContainer = $pickerContainer.find('input[type=text]');

            $pickerContainer.bind('PickCoordinates', function (event, mapLoader) {
                $.get(mapLoader, function (response) {
                    var coordinates = Coordinates.Parse($coordinateContainer.val());
                    if (coordinates.IsValid() && coordinates.IsSpecified()) {
                        CoordinatePicker.Open({ Coordinates: coordinates, Zoom: 15, Markers: response.Markers, Callback: handleCoordinatePickerResult });
                        return;
                    }
                    if (response.CalculatedCoordinates != null) {
                        CoordinatePicker.Open({ Zoom: 15, Markers: response.Markers, Callback: handleCoordinatePickerResult,
                            Coordinates: Coordinates.Create(Latitude.Create(response.CalculatedCoordinates.Latitude), Longitude.Create(response.CalculatedCoordinates.Longitude))
                        });
                        return;
                    } 
                    if (options.AddressCalculator != null && options.AddressCalculator.call($pickerContainer) != null) {
                        var address = options.AddressCalculator.call($pickerContainer);
                        new google.maps.Geocoder().geocode({ address: address },
                            function (results, status) {
                                if (status == google.maps.GeocoderStatus.OK) {
                                    CoordinatePicker.Open({ Markers: response.Markers, Callback: handleCoordinatePickerResult,
                                        Coordinates: Coordinates.Create(Latitude.Create(results[0].geometry.location.lat()), Longitude.Create(results[0].geometry.location.lng()))
                                    });
                                } else {
                                    CoordinatePicker.Open({ Markers: response.Markers, Callback: handleCoordinatePickerResult });
                                }
                            }
                        );
                        return;
                    }
                    CoordinatePicker.Open({ Markers: response.Markers, Callback: handleCoordinatePickerResult });
                });
                return false;
            });

            function handleCoordinatePickerResult(result) {
                if (result.Success) { 
                    $coordinateContainer.val(result.Coordinates.ToString()); 
                    $coordinateContainer.trigger('change'); 
                }
            }
        });
    };
})(jQuery);
