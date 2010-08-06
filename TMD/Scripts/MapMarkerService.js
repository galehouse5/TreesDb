var MapMarkerService = new function () {
    var me = this;
    var siteMarkerImage, subsiteMarkerImage, treeMarkerImage;
    var siteMarkerShadowImage, subsiteMarkerShadowImage, treeMarkerShadowImage;

    var initialize = function () {
        siteMarkerImage = new google.maps.MarkerImage(
            '/Images/Site32.png',
            new google.maps.Size(32, 32));
        siteMarkerShadowImage = new google.maps.MarkerImage(
            '/Images/Site32s.png',
            new google.maps.Size(59, 32),
            new google.maps.Point(0, 0),
            new google.maps.Point(16, 32));
        subsiteMarkerImage = new google.maps.MarkerImage(
            '/Images/Subsite32.png',
            new google.maps.Size(32, 32));
        subsiteMarkerShadowImage = new google.maps.MarkerImage(
            '/Images/Subsite32s.png',
            new google.maps.Size(59, 32),
            new google.maps.Point(0, 0),
            new google.maps.Point(16, 32));
        singleTrunkTreeMarkerImage = new google.maps.MarkerImage(
            '/Images/SingleTrunkTree32.png',
            new google.maps.Size(32, 32));
        singleTrunkTreeMarkerShadowImage = new google.maps.MarkerImage(
            '/Images/SingleTrunkTree32s.png',
            new google.maps.Size(59, 32),
            new google.maps.Point(0, 0),
            new google.maps.Point(16, 32));
        multiTrunkTreeMarkerImage = new google.maps.MarkerImage(
            '/Images/MultiTrunkTree32.png',
            new google.maps.Size(32, 32));
        multiTrunkTreeMarkerShadowImage = new google.maps.MarkerImage(
            '/Images/MultiTrunkTree32s.png',
            new google.maps.Size(59, 32),
            new google.maps.Point(0, 0),
            new google.maps.Point(16, 32));
    }
    google.setOnLoadCallback(initialize);

    me.CreateMapMarker = function (options) {
        var marker;
        switch (options.Level) {
            case 'Site':
                marker = new google.maps.Marker({
                    icon: siteMarkerImage,
                    shadow: siteMarkerShadowImage,
                    title: options.Title,
                    position: new google.maps.LatLng(options.Latitude, options.Longitude)
                });
                break;
            case 'Subsite':
                marker = new google.maps.Marker({
                    icon: subsiteMarkerImage,
                    shadow: subsiteMarkerShadowImage,
                    title: options.Title,
                    position: new google.maps.LatLng(options.Latitude, options.Longitude)
                });
                break;
            case 'SingleTrunkTree':
                marker = new google.maps.Marker({
                    icon: singleTrunkTreeMarkerImage,
                    shadow: singleTrunkTreeMarkerShadowImage,
                    title: options.Title,
                    position: new google.maps.LatLng(options.Latitude, options.Longitude)
                });
                break;
            case 'MultiTrunkTree':
                marker = new google.maps.Marker({
                    icon: multiTrunkTreeMarkerImage,
                    shadow: multiTrunkTreeMarkerShadowImage,
                    title: options.Title,
                    position: new google.maps.LatLng(options.Latitude, options.Longitude)
                });
                break;
        }
        return marker;
    }
};