google.maps.Map.prototype.getSingletonInfoWindow = function () {
    if (!this.internalSingletonInfoWindow) { this.internalSingletonInfoWindow = new google.maps.InfoWindow(); }
    return this.internalSingletonInfoWindow;
};
google.maps.Map.prototype.UseEventListener = function (eventListener) {
    if (!this.internalEventListeners) { this.internalEventListeners = new Array(); }
    this.internalEventListeners.push(eventListener);
};
google.maps.Map.prototype.getMarkers = function () {
    if (!this.internalMarkers) { this.internalMarkers = new Array(); }
    return this.internalMarkers;
};
google.maps.Map.prototype.AddMarker = function (initializedMarker) {
    initializedMarker.setMap(this);
    initializedMarker.NotifyMapZoomChanged(this);
    var map = this;
    this.UseEventListener(google.maps.event.addListener(this, 'zoom_changed', function () { initializedMarker.NotifyMapZoomChanged(map); }));
    this.UseEventListener(google.maps.event.addListener(initializedMarker, 'click', function () { initializedMarker.ShowInfo(map); }));
    this.UseEventListener(google.maps.event.addListener(initializedMarker, 'dblclick', function () { initializedMarker.Focus(map); }));
    this.getMarkers().push(initializedMarker);
};
google.maps.Map.prototype.DisposeEventListeners = function () {    
    if (!this.internalEventListeners) { this.internalEventListeners = new Array(); }
    while (this.internalEventListeners.length > 0) {
        google.maps.event.removeListener(this.internalEventListeners.pop());
    }
};
google.maps.Map.prototype.DisposeMarkers = function () {
    while (this.getMarkers().length > 0) {
        var marker = this.getMarkers().pop();
        marker.setMap(null);
    }
};

google.maps.Marker.prototype.getLoadedInfo = function () { return this.internalLoadedInfo; };
google.maps.Marker.prototype.setLoadedInfo = function (info) { this.internalLoadedInfo = info; };
google.maps.Marker.prototype.setOptions = function (options) { this.internalOptions = options; };
google.maps.Marker.prototype.getOptions = function () { return this.internalOptions; };
google.maps.Marker.prototype.NotifyMapZoomChanged = function (map) {
    if (this.getOptions().MinZoom || this.getOptions().MaxZoom) {
        this.setVisible(
            map.getZoom() <= this.getOptions().MaxZoom
            && map.getZoom() >= this.getOptions().MinZoom);
    }
};
google.maps.Marker.prototype.Initialize = function (options) {
    this.setOptions(options);
    this.setTitle(options.Title);
    this.setIcon(options.IconUrl);
    this.setPosition(new google.maps.LatLng(options.Latitude, options.Longitude));
};
google.maps.Marker.prototype.ShowInfo = function (map) {
    if (this.getLoadedInfo()) {
        map.getSingletonInfoWindow().setContent(this.getLoadedInfo()[0]);
        map.getSingletonInfoWindow().open(map, this);
    } else {
        var marker = this;
        $.get(this.getOptions().InfoLoaderUrl, function (response) {
            marker.setLoadedInfo($(response).InitializeUi());
            map.getSingletonInfoWindow().setContent(marker.getLoadedInfo()[0]);
            map.getSingletonInfoWindow().open(map, marker);
        });
    }
};
google.maps.Marker.prototype.Focus = function (map) {
    map.setZoom(this.getOptions().MaxZoom + 1);
    map.panTo(this.getPosition());
};
