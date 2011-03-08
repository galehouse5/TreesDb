String.prototype.Trim = function () {
    return this.replace(/^\s*/, '').replace(/\s*$/, '');
};

String.prototype.IsNullOrWhitespace = function () {
    return this == null || this.Trim() == '';
};

String.prototype.Contains = function (substring) {
    return this.indexOf(substring) > -1;
};

Number.prototype.RoundToDecimals = function (decimals) {
    return Math.round(this * Math.pow(10, decimals)) / Math.pow(10, decimals);
};

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

var slate = {};

slate = function ()
{
	var pub = {};
	var self = {};
	var chartColors = ['#263849','#FF9900','#555','#777','#999','#bbb','#ccc','#eee'];

	pub.init = function () {
	    $('#search').find('input').live('click', function () { $(this).val('') });
	    $("form.form select, form.form input:checkbox, form.form input:radio, form.form input:file").uniform();

	    $('*[rel=datatable]').dataTable();

	    $("*[rel=tooltip]").tipsy({ gravity: 's' });
	    $("*[rel=facebox]").facebox();

	    $('table.stats').each(function () {
	        var chartType = '';

	        if ($(this).attr('title')) {
	            chartType = $(this).attr('title');
	        }
	        else {
	            chartType = 'area';
	        }

	        var chart_width = $(this).parents('.portlet').width() * .85;

	        $(this).hide().visualize({
	            type: chartType, // 'bar', 'area', 'pie', 'line'
	            width: chart_width,
	            height: '240px',
	            colors: chartColors
	        });
	    });
	}

	return pub;
	
}();
slate.portlet = function ()
{
	var pub = {};
	var self = {};
	
	pub.init = function ()
	{
		$('.portlet-closable .portlet-header').live ( 'click', self.togglePortlet );
		$('.portlet-tab-nav a').live ( 'click' , self.selectTabContent );
		
		$('.portlet-closable .portlet-header').each ( function () 
		{			
			$(this).append ('<span class="portlet-toggle-icon"></span>');
		});		
		
		$('.portlet-tab-nav li').each ( function () 
		{			
			if ( $(this).hasClass ('portlet-tab-nav-active') )
			{
				var id = $(this).find ('a').attr ('href');
				$(this).parents ('.portlet').find ( id ).show ().addClass ('portlet-tab-content-active').siblings ().hide ();
			}			
		});
	}
	
	self.selectTabContent = function ()
	{
		$(this).parents ('ul').find ('li').removeClass ('portlet-tab-nav-active');
		$(this).parents ('li').addClass ('portlet-tab-nav-active');
		var $portlet = $(this).parents ('.portlet');
		$portlet.find ('#' + $(this).attr ('href') ).show ().siblings ().hide ();
		return false;
	}
	
	self.togglePortlet = function ()
	{
		var $this = $(this);	
		var $portlet = $this.parent ();
		var $content = $portlet.find ('.portlet-content');
		
		var browser = $.browser.msie + $.browser.version;
		if ( browser == 'true7.0' )
			$content.toggle ();
		else
			$content.slideToggle ();
		
		$portlet.toggleClass ('portlet-state-closed');
		return false;
	}

	
	return pub;
	
}();
