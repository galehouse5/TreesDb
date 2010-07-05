var MapMarkerService = new function () {
    var me = this;
    var siteMarkerImage, subsiteMarkerImage, treeMarkerImage;
    var siteMarkerShadowImage, subsiteMarkerShadowImage, treeMarkerShadowImage;

    var initialize = function () {
        siteMarkerImage = new google.maps.MarkerImage(
            '/Styles/Images/site32.png',
            new google.maps.Size(32, 32));
        siteMarkerShadowImage = new google.maps.MarkerImage(
            '/Styles/Images/site32s.png',
            new google.maps.Size(59, 32),
            new google.maps.Point(0, 0),
            new google.maps.Point(16, 32));
        subsiteMarkerImage = new google.maps.MarkerImage(
            '/Styles/Images/subsite32.png',
            new google.maps.Size(32, 32));
        subsiteMarkerShadowImage = new google.maps.MarkerImage(
            '/Styles/Images/subsite32s.png',
            new google.maps.Size(59, 32),
            new google.maps.Point(0, 0),
            new google.maps.Point(16, 32));
        treeMarkerImage = new google.maps.MarkerImage(
            '/Styles/Images/tree32.png',
            new google.maps.Size(32, 32));
        treeMarkerShadowImage = new google.maps.MarkerImage(
            '/Styles/Images/tree32s.png',
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
            case 'Site':
                marker = new google.maps.Marker({
                    icon: treeMarkerImage,
                    shadow: treeMarkerShadowImage,
                    title: options.Title,
                    position: new google.maps.LatLng(options.Latitude, options.Longitude)
                });
                break;
        }
        return marker;
    }
};