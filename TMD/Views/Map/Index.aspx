<%@ Page Title="Map" Language="C#" MasterPageFile="~/Views/Shared/Site.Master" Inherits="System.Web.Mvc.ViewPage" %>

<asp:Content ContentPlaceHolderID="Styles" runat="server">
    <style type="text/css">
        #map { position: absolute; top: 0; left: 0; bottom: 0; right: 0; }
        #header { z-index: 100; }
        #nav { z-index: 100; }
    </style>
</asp:Content>

<asp:Content ContentPlaceHolderID="Scripts" runat="server">
    <script type="text/javascript">
        // normalize html structure and css rules
        $(function () {
            $('#content').remove();
            $('#footer').remove();
            $('#wrapper').css('margin-bottom', 0);
            $('body').css('min-height', '0');
        });
    </script>
    <% Html.RenderAction("GoogleMapsScript"); %>
    <script type="text/javascript">
        google.setOnLoadCallback(function () {
            $('#wrapper').append('<div id="map"></div>');

            var map = new google.maps.Map($('#map')[0], {
                center: new google.maps.LatLng(36.94167, -95.825),
                zoom: 5,
                mapTypeId: google.maps.MapTypeId.TERRAIN,
                scaleControl: true,
                mapTypeControlOptions: {
                    mapTypeIds: [google.maps.MapTypeId.TERRAIN, google.maps.MapTypeId.SATELLITE, google.maps.MapTypeId.HYBRID],
                    position: google.maps.ControlPosition.RIGHT_BOTTOM,
                    style: google.maps.MapTypeControlStyle.HORIZONTAL_BAR
                },
                navigationControlOptions: {
                    position: google.maps.ControlPosition.LEFT_BOTTOM,
                    style: google.maps.NavigationControlStyle.SMALL
                }
            });
            var info = new google.maps.InfoWindow();
            google.maps.event.addListener(map, 'zoom_changed', function () { info.close(); });
            function addMarker(options) {
                var marker = new google.maps.Marker({
                    icon: options.Icon, map: map, title: options.Title,
                    position: new google.maps.LatLng(options.Coordinates.Latitude, options.Coordinates.Longitude)
                });
                marker.setVisible(map.getZoom() <= options.MaxZoom && map.getZoom() >= options.MinZoom);
                google.maps.event.addListener(map, 'zoom_changed', function () {
                    marker.setVisible(map.getZoom() <= options.MaxZoom && map.getZoom() >= options.MinZoom);
                });
                google.maps.event.addListener(marker, 'click', function () {
                    info.setContent(options.Info);
                    info.open(map, marker);
                });
                google.maps.event.addListener(marker, 'dblclick', function () {
                    map.setZoom(options.MaxZoom + 1);
                    map.panTo(marker.getPosition());
                });
            };
            $.get('/Map/ViewMarkers', function (response) {
                map.fitBounds(new google.maps.LatLngBounds(
                    new google.maps.LatLng(response.CoordinateBounds.SWCoordinates.Latitude, response.CoordinateBounds.SWCoordinates.Longitude),
                    new google.maps.LatLng(response.CoordinateBounds.NECoordinates.Latitude, response.CoordinateBounds.NECoordinates.Longitude)));
                for (i in response.Markers) {
                    addMarker(response.Markers[i]);
                }
            });
        });
    </script>
</asp:Content>
