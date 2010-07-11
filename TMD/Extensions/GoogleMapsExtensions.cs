using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.Web.Mvc;
using System.Text;
using TMD.Model.Trips;

namespace TMD.Extensions
{
    public class MapMarker
    {
        public string Level { get; set; }
        public string Title { get; set; }
        public float Latitude { get; set; }
        public float Longitude { get; set; }
    }

    public static class GoogleMapsExtensions
    {
        public static MvcHtmlString LoadGoogleMapsApiV3(this HtmlHelper helper)
        {
            StringBuilder sb = new StringBuilder();
            sb.AppendLine(string.Format("<script src='http://www.google.com/jsapi?key={0}' type='text/javascript'></script>", WebApplicationRegistry.Settings.GoogleApiKey));
            sb.AppendLine("<script type='text/javascript'>google.load('maps', '3', { other_params: 'sensor=false' });</script>");
            return MvcHtmlString.Create(sb.ToString());
        }

        public static MapMarker ToMapMarker(this SiteVisit sv)
        {
            return new MapMarker()
            {
                Level = "Site",
                Title = sv.Name,
                Latitude = sv.Coordinates.Latitude.TotalDegrees,
                Longitude = sv.Coordinates.Longitude.TotalDegrees
            };
        }

        public static MapMarker ToMapMarker(this SubsiteVisit ssv)
        {
            return new MapMarker()
            {
                Level = "Subsite",
                Title = ssv.Name,
                Latitude = ssv.Coordinates.Latitude.TotalDegrees,
                Longitude = ssv.Coordinates.Longitude.TotalDegrees
            };
        }

        public static MapMarker ToMapMarker(this TreeMeasurement tm)
        {
            return new MapMarker()
            {
                Level = "Tree",
                Title = tm.ScientificName,
                Latitude = tm.Coordinates.Latitude.TotalDegrees,
                Longitude = tm.Coordinates.Longitude.TotalDegrees
            };
        }
    }
}