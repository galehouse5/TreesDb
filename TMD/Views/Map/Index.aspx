<%@ Page Title="Map" Language="C#" MasterPageFile="~/Views/Shared/Site.Master" Inherits="System.Web.Mvc.ViewPage" %>

<asp:Content ContentPlaceHolderID="Styles" runat="server">
    <style type="text/css">
        #map { position: absolute; top: 0; left: 0; bottom: 0; right: 0; z-index: 299; }
        #header { z-index: 300; }
        #nav { z-index: 300; }
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
            var options = {
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
            };
            var map = new google.maps.Map($('#map')[0], options);
        });
    </script>
</asp:Content>
