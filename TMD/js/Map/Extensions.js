google.maps.Map.prototype.getSingletonInfoWindow = function () {
    if (!this.internalSingletonInfoWindow) { this.internalSingletonInfoWindow = new google.maps.InfoWindow(); }
    return this.internalSingletonInfoWindow;
};

google.maps.Map.prototype.UseEventListener = function (eventListener) {
    if (!this.internalEventListeners) { this.internalEventListeners = new Array(); }
    this.internalEventListeners.push(eventListener);
};

google.maps.Map.prototype.DisposeEventListeners = function () {
    if (!this.internalEventListeners) { this.internalEventListeners = new Array(); }
    while (this.internalEventListeners.length > 0) {
        google.maps.event.removeListener(this.internalEventListeners.pop());
    }
};

google.maps.Marker.prototype.getLoadedInfo = function () {
    return this.internalLoadedInfo;
};

google.maps.Marker.prototype.setLoadedInfo = function (info) {
    this.internalLoadedInfo = info;
};

google.maps.Map.prototype.getMarkers = function () {
    if (!this.internalMarkers) { this.internalMarkers = new Array(); }
    return this.internalMarkers;
};

google.maps.Map.prototype.DisposeMarkers = function () {
    while (this.getMarkers().length > 0) {
        var marker = this.getMarkers().pop();
        marker.setMap(null);
    }
};

google.maps.Map.prototype.CreateAndAddMarker = function (options) {

    var map = this;
    var marker = new google.maps.Marker({ map: this,
        icon: options.DefaultIconUrl, title: options.Title,
        position: new google.maps.LatLng(options.Latitude, options.Longitude)
    });
    this.getMarkers().push(marker);

    function refreshVisibilityAndIcon() {
        if (options.MaxZoom) {
            marker.setVisible(map.getZoom() <= options.MaxZoom && map.getZoom() >= options.MinZoom);
        }
        if (options.DynamicIcons) {
            for (i in options.DynamicIcons) {
                var icon = options.DynamicIcons[i];
                if (map.getZoom() <= icon.MaxZoom && map.getZoom() >= icon.MinZoom) {
                    marker.setIcon(icon.IconLoaderUrl);
                }
            }
        }
    }

    function showInfo() {
        if (!marker.getLoadedInfo()) {
            $.get(options.InfoLoaderUrl, function (response) {
                marker.setLoadedInfo($(response).InitializeUi());
                map.getSingletonInfoWindow().setContent(marker.getLoadedInfo()[0]);
                map.getSingletonInfoWindow().open(map, marker);
            });
        } else {
            map.getSingletonInfoWindow().setContent(marker.getLoadedInfo()[0]);
            map.getSingletonInfoWindow().open(map, marker);
        }
    }

    function focus() {
        map.setZoom(options.MaxZoom + 1);
        map.panTo(marker.getPosition());
    }

    this.UseEventListener(google.maps.event.addListener(this, 'zoom_changed', refreshVisibilityAndIcon));
    this.UseEventListener(google.maps.event.addListener(marker, 'click', showInfo));
    this.UseEventListener(google.maps.event.addListener(marker, 'dblclick', focus));

    refreshVisibilityAndIcon();
};


