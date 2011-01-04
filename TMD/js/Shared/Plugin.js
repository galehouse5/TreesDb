/*
* Facebox (for jQuery)
* version: 1.2 (05/05/2008)
* @requires jQuery v1.2 or later
*
* Examples at http://famspam.com/facebox/
*
* Licensed under the MIT:
*   http://www.opensource.org/licenses/mit-license.php
*
* Copyright 2007, 2008 Chris Wanstrath [ chris@ozmm.org ]
*
* Usage:
*
*  jQuery(document).ready(function() {
*    jQuery('a[rel*=facebox]').facebox()
*  })
*
*  <a href="#terms" rel="facebox">Terms</a>
*    Loads the #terms div in the box
*
*  <a href="terms.html" rel="facebox">Terms</a>
*    Loads the terms.html page in the box
*
*  <a href="terms.png" rel="facebox">Terms</a>
*    Loads the terms.png image in the box
*
*
*  You can also use it programmatically:
*
*    jQuery.facebox('some html')
*    jQuery.facebox('some html', 'my-groovy-style')
*
*  The above will open a facebox with "some html" as the content.
*
*    jQuery.facebox(function($) {
*      $.get('blah.html', function(data) { $.facebox(data) })
*    })
*
*  The above will show a loading screen before the passed function is called,
*  allowing for a better ajaxy experience.
*
*  The facebox function can also display an ajax page, an image, or the contents of a div:
*
*    jQuery.facebox({ ajax: 'remote.html' })
*    jQuery.facebox({ ajax: 'remote.html' }, 'my-groovy-style')
*    jQuery.facebox({ image: 'stairs.jpg' })
*    jQuery.facebox({ image: 'stairs.jpg' }, 'my-groovy-style')
*    jQuery.facebox({ div: '#box' })
*    jQuery.facebox({ div: '#box' }, 'my-groovy-style')
*
*  Want to close the facebox?  Trigger the 'close.facebox' document event:
*
*    jQuery(document).trigger('close.facebox')
*
*  Facebox also has a bunch of other hooks:
*
*    loading.facebox
*    beforeReveal.facebox
*    reveal.facebox (aliased as 'afterReveal.facebox')
*    init.facebox
*    afterClose.facebox
*
*  Simply bind a function to any of these hooks:
*
*   $(document).bind('reveal.facebox', function() { ...stuff to do after the facebox and contents are revealed... })
*
*/
(function ($) {
    $.facebox = function (data, klass) {
        $.facebox.loading()

        if (data.ajax) fillFaceboxFromAjax(data.ajax, klass)
        else if (data.image) fillFaceboxFromImage(data.image, klass)
        else if (data.div) fillFaceboxFromHref(data.div, klass)
        else if ($.isFunction(data)) data.call($)
        else $.facebox.reveal(data, klass)
    }

    /*
    * Public, $.facebox methods
    */

    $.extend($.facebox, {
        settings: {
            opacity: .35,
            overlay: true,
            loadingImage: '/images/loading.gif',
            closeImage: '/images/closelabel.gif',
            imageTypes: ['png', 'jpg', 'jpeg', 'gif', ''],
            faceboxHtml: '\
    <div id="facebox" style="display:none;"> \
      <div class="popup"> \
        <table> \
          <tbody id="facebox-tbody"> \
            <tr> \
              <td class="tl"/><td class="b"/><td class="tr"/> \
            </tr> \
            <tr> \
              <td class="b"/> \
              <td class="body"> \
                <div class="content"> \
                </div> \
                <div class="footer"> \
                  <a href="#" class="close"> \
                    <img src="/images/closelabel.gif" title="close" class="close_image" /> \
                  </a> \
                </div> \
              </td> \
              <td class="b"/> \
            </tr> \
            <tr> \
              <td class="bl"/><td class="b"/><td class="br"/> \
            </tr> \
          </tbody> \
        </table> \
      </div> \
    </div>'
        },

        loading: function () {
            init()
            if ($('#facebox .loading').length == 1) return true
            showOverlay()

            $('#facebox .content').empty()
            $('#facebox .body').children().hide().end().
        append('<div class="loading"><img src="' + $.facebox.settings.loadingImage + '"/></div>')

            $('#facebox').css({
                top: getPageScroll()[1] + (getPageHeight() / 10),
                left: $(window).width() / 2 - 205
            }).show()

            $(document).bind('keydown.facebox', function (e) {
                if (e.keyCode == 27) $.facebox.close()
                return true
            })
            $(document).trigger('loading.facebox')
        },

        reveal: function (data, klass) {
            $(document).trigger('beforeReveal.facebox')
            if (klass) $('#facebox .content').addClass(klass)
            $('#facebox .content').append(data)
            $('#facebox .loading').remove()
            $('#facebox .body').children().fadeIn('normal')
            $('#facebox').css('left', $(window).width() / 2 - ($('#facebox table').width() / 2))
            $(document).trigger('reveal.facebox').trigger('afterReveal.facebox')
        },

        close: function () {
            $(document).trigger('close.facebox')
            return false
        }
    })

    /*
    * Public, $.fn methods
    */

    $.fn.facebox = function (settings) {
        if ($(this).length == 0) return

        init(settings)

        function clickHandler() {
            $.facebox.loading(true)

            // support for rel="facebox.inline_popup" syntax, to add a class
            // also supports deprecated "facebox[.inline_popup]" syntax
            var klass = this.rel.match(/facebox\[?\.(\w+)\]?/)
            if (klass) klass = klass[1]

            fillFaceboxFromHref(this.href, klass)
            return false
        }

        return this.bind('click.facebox', clickHandler)
    }

    /*
    * Private methods
    */

    // called one time to setup facebox on this page
    function init(settings) {
        if ($.facebox.settings.inited) return true
        else $.facebox.settings.inited = true

        $(document).trigger('init.facebox')
        makeCompatible()

        var imageTypes = $.facebox.settings.imageTypes.join('|')
        $.facebox.settings.imageTypesRegexp = new RegExp('\.(' + imageTypes + ')$', 'i')

        if (settings) $.extend($.facebox.settings, settings)
        $('body').append($.facebox.settings.faceboxHtml)

        var preload = [new Image(), new Image()]
        preload[0].src = $.facebox.settings.closeImage
        preload[1].src = $.facebox.settings.loadingImage

        $('#facebox').find('.b:first, .bl').each(function () {
            preload.push(new Image())
            preload.slice(-1).src = $(this).css('background-image').replace(/url\((.+)\)/, '$1')
        })

        $('#facebox .close').click($.facebox.close)
        $('#facebox .close_image').attr('src', $.facebox.settings.closeImage)
    }

    // getPageScroll() by quirksmode.com
    function getPageScroll() {
        var xScroll, yScroll;
        if (self.pageYOffset) {
            yScroll = self.pageYOffset;
            xScroll = self.pageXOffset;
        } else if (document.documentElement && document.documentElement.scrollTop) {	 // Explorer 6 Strict
            yScroll = document.documentElement.scrollTop;
            xScroll = document.documentElement.scrollLeft;
        } else if (document.body) {// all other Explorers
            yScroll = document.body.scrollTop;
            xScroll = document.body.scrollLeft;
        }
        return new Array(xScroll, yScroll)
    }

    // Adapted from getPageSize() by quirksmode.com
    function getPageHeight() {
        var windowHeight
        if (self.innerHeight) {	// all except Explorer
            windowHeight = self.innerHeight;
        } else if (document.documentElement && document.documentElement.clientHeight) { // Explorer 6 Strict Mode
            windowHeight = document.documentElement.clientHeight;
        } else if (document.body) { // other Explorers
            windowHeight = document.body.clientHeight;
        }
        return windowHeight
    }

    // Backwards compatibility
    function makeCompatible() {
        var $s = $.facebox.settings

        $s.loadingImage = $s.loading_image || $s.loadingImage
        $s.closeImage = $s.close_image || $s.closeImage
        $s.imageTypes = $s.image_types || $s.imageTypes
        $s.faceboxHtml = $s.facebox_html || $s.faceboxHtml
    }

    // Figures out what you want to display and displays it
    // formats are:
    //     div: #id
    //   image: blah.extension
    //    ajax: anything else
    function fillFaceboxFromHref(href, klass) {
        // div
        if (href.match(/#/)) {
            var url = window.location.href.split('#')[0]
            var target = href.replace(url, '')
            if (target == '#') return
            $.facebox.reveal($(target).html(), klass)

            // image
        } else if (href.match($.facebox.settings.imageTypesRegexp)) {
            fillFaceboxFromImage(href, klass)
            // ajax
        } else {
            fillFaceboxFromAjax(href, klass)
        }
    }

    function fillFaceboxFromImage(href, klass) {
        var image = new Image()
        image.onload = function () {
            $.facebox.reveal('<div class="image"><img src="' + image.src + '" /></div>', klass)
        }
        image.src = href
    }

    function fillFaceboxFromAjax(href, klass) {
        $.get(href, function (data) { $.facebox.reveal(data, klass) })
    }

    function skipOverlay() {
        return $.facebox.settings.overlay == false || $.facebox.settings.opacity === null
    }

    function showOverlay() {
        if (skipOverlay()) return

        if ($('#facebox_overlay').length == 0)
            $("body").append('<div id="facebox_overlay" class="facebox_hide"></div>')

        $('#facebox_overlay').hide().addClass("facebox_overlayBG")
      .css('opacity', $.facebox.settings.opacity)
      .click(function () { $(document).trigger('close.facebox') })
      .fadeIn(200)
        return false
    }

    function hideOverlay() {
        if (skipOverlay()) return

        $('#facebox_overlay').fadeOut(200, function () {
            $("#facebox_overlay").removeClass("facebox_overlayBG")
            $("#facebox_overlay").addClass("facebox_hide")
            $("#facebox_overlay").remove()
        })

        return false
    }

    /*
    * Bindings
    */

    $(document).bind('close.facebox', function () {
        $(document).unbind('keydown.facebox')
        $('#facebox').fadeOut(function () {
            $('#facebox .content').removeClass().addClass('content')
            hideOverlay()
            $('#facebox .loading').remove()
            $(document).trigger('afterClose.facebox')
        })
    })

})(jQuery);


/*
* upclick(params)
*
*  parameters:
*      element:        DOM object
*      action:         Server script who receive file
*      action_params:  Server script parameters. Array: key=value
*      dataname:       File data name. Default: Filedata
*      maxsize:        Maximum file size (in Bytes). 0 - unlimited
*      target:         Response target name: '_new', '_blank',... Default: <Hidden frame name>
*      zindex:         z-index listener
*      onstart:        Callback function
*                        onstart(filename).
*                        Emited when file started upload
*      oncomplete:      Callback function
*                        oncomplete(server_response_data).
*                        Emited when file successfully onloaded
*/
function upclick(params) {
    // Parse params
    var defaults =
        {
            element: null,
            action: 'about:blank',
            action_params: {},
            maxsize: 0,
            onstart: null,
            oncomplete: null,
            dataname: 'Filedata',
            target: null,
            zindex: 'auto'
        };

    for (var key in defaults) {
        params[key] = params[key] ? params[key] : defaults[key];
    }


    var element = params['element'];
    if (typeof element == 'string')
        element = document.getElementById(element);

    var doc = element.ownerDocument;
    var input;

    // div
    var container = doc.createElement("div");

    // frame -> div
    var frame_name = 'frame' + new Date().getTime().toString().substr(8);

    // IE require such creation method
    container.innerHTML =
        '<iframe name="' + frame_name + '" src="about:blank" onload="this.onload_callback()"></iframe>';
    var frame = container.childNodes[0];

    // Callback for 'onload' event. Fired when form submited and data retrived
    frame.onload_callback =
        function () {
            // Phase 1. First 'onload' when element created
            // form -> div
            var form = doc.createElement('form');
            container.appendChild(form);
            form.method = 'post';
            form.enctype = 'multipart/form-data';
            form.encoding = 'multipart/form-data';
            if (params['target']) {
                form.target = params['target'];
                form.setAttribute('target', params['target']);
            }
            else {
                form.target = frame_name;
                form.setAttribute('target', frame_name);
            }
            form.action = params['action'];
            form.setAttribute('action', params['action']);
            form.style.margin = 0;
            form.style.padding = 0;
            form.style.height = '80px';
            form.style.width = '40px';

            // append params in form
            var action_params = params['action_params'];
            for (var key in action_params) {
                var hidden = doc.createElement("input");
                hidden.type = "hidden";
                hidden.name = key;
                hidden.value = String(action_params[key]);
                form.appendChild(hidden);
            }

            // MAX_FILESIZE. Maximum file size
            if (params['maxsize']) {
                var input_ms = doc.createElement('input');
                input_ms.type = 'hidden';
                input_ms.name = 'MAX_FILE_SIZE';
                input_ms.value = String(params['maxsize']);
                form.appendChild(input_ms);
            }

            // input -> form
            input = doc.createElement("input");
            input.name = params['dataname'];
            input.type = 'file';
            input.size = '1';
            form.appendChild(input);

            // input style
            input.style.position = 'absolute';
            input.style.display = 'block';
            input.style.top = 0;
            input.style.left = 0;
            input.style.height = form.style.height;
            input.style.width = '80px';
            input.style.opacity = 0;
            input.style.filter = 'alpha(opacity=0)';
            input.style.fontSize = 8;
            input.style.zIndex = 1;
            input.style.visiblity = 'hidden';
            input.style.marginLeft = '-40px'; // hide IE text field
            //input.style.cursor = 'pointer';

            // input click handler (enable container event listener)

            // 'change' event handler. Submit form
            var onchange_callback =
                function (e) {
                    // empty filename check
                    if (!input.value)
                        return;

                    // Run onstart callback. When upload started
                    var onstart = params['onstart'];
                    if (onstart)
                        onstart(input.value);

                    form.submit();
                };

            // bind 'change' callback
            // DOM2: FF, Opera, Chrome
            if (input.addEventListener)
                input.addEventListener('change', onchange_callback, false);

            // IE 5+
            else if (input.attachEvent) {
                input.attachEvent(
                    'onpropertychange',
                    function (e) {
                        // Get event details for IE
                        if (!e)
                            e = window.event;

                        if (e.propertyName == 'value')
                            onchange_callback();
                    }
                    );
            }
            // IE 4
            else
                input.onpropertychange = onchange_callback;


            // Phase 2. Next 'onload' when data received from server
            frame.onload_callback =
                function () {
                    var ifwin = null;

                    // Get frame window
                    // IE5.5+, Mozilla, NN7
                    if (frame.contentWindow)
                        ifwin = frame.contentWindow;
                    // NN6, Konqueror
                    else if (frame.contentDocument)
                        ifwin = frame.contentDocument.defaultView;

                    // Run 'oncomplete' callback
                    var data = ifwin.document.body.innerHTML;
                    var oncomplete = params['oncomplete'];
                    if (oncomplete)
                        oncomplete(data);

                    // Clear filename
                    form.reset();
                }
        };

    // frame style
    frame.style.display = 'none';
    frame.width = 0;
    frame.height = 0;
    frame.marginHeight = 0;
    frame.marginWidth = 0;

    // container -> DOM
    doc.body.insertBefore(container, doc.body.firstChild);

    // container style
    container.style.position = 'absolute';
    container.style.overflow = 'hidden';
    container.style.padding = 0;
    container.style.margin = 0;
    container.style.visiblity = 'hidden';
    container.style.width = '0px';
    container.style.height = '0px';
    //container.style.cursor = 'pointer'; // FIXME flashed on IE

    // zindex detection
    if (params['zindex'] == 'auto') {
        var zi = 0, ziparsed;
        var obj = element;
        var comp;

        while (obj.tagName != 'BODY') {
            comp = obj.currentStyle ? obj.currentStyle : getComputedStyle(obj, null);
            ziparsed = parseInt(comp.zIndex);
            ziparsed = isNaN(ziparsed) ? 0 : ziparsed;
            zi += ziparsed + 1;
            obj = obj.parentNode
        }

        container.style.zIndex = zi;
    }
    else {
        container.style.zIndex = params['zindex'];
    }

    // If cursor out of element => shitch off listener
    var onmouseout_callback =
    function (e) {
        if (!e)
            e = window.event;

        container.style.width = '0px';
        container.style.height = '0px';
        var receiver = doc.elementFromPoint(e.clientX, e.clientY);

        if (receiver === element) {
            container.style.width = '40px';
            container.style.height = '80px';
        }
    }
    // DOM2: FF, Chrome, Opera
    if (container.addEventListener)
        container.addEventListener('mousemove', onmouseout_callback, false);
    // IE 5+
    else if (container.attachEvent)
        container.attachEvent("onmousemove", onmouseout_callback);


    // Move the input with the mouse to make sure it get clicked!
    var onmousemove_callback =
        function (e) {
            // Get event details for IE
            if (!e)
                e = window.event;

            // find element position,
            var x = y = 0;

            if (e.pageX)
                x = e.pageX;
            else if (e.clientX)
                x = e.clientX +
                (doc.documentElement.scrollLeft ?
                    doc.documentElement.scrollLeft :
                    doc.body.scrollLeft);

            if (e.pageY)
                y = e.pageY;
            else if (e.clientY)
                y = e.clientY +
                    (doc.documentElement.scrollTop ?
                        doc.documentElement.scrollTop :
                        doc.body.scrollTop);

            // move listener
            container.style.left = x - 20 + 'px';
            container.style.top = y - 40 + 'px';
            container.style.width = '40px';
            container.style.height = '80px';
        };

    // bind mousemove callback (for place button under cursor)
    // DOM2: FF, Chrome, Opera
    if (element.addEventListener)
        element.addEventListener('mousemove', onmousemove_callback, false);
    // IE 5+
    else if (element.attachEvent)
        element.attachEvent("onmousemove", onmousemove_callback);
}
