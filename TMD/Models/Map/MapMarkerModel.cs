using System.Web.Mvc;
using TMD.Model;

namespace TMD.Models.Map
{
    public class MapMarkerModel
    {
        public string Title { get; set; }
        public Coordinates Position { get; set; }
        public ActionResult InfoLoaderAction { get; set; }
        public int? MinZoom { get; set; }
        public int? MaxZoom { get; set; }
        public string DefaultIconUrl { get; set; }
        public ActionResult IconLoaderAction { get; set; }

        public object ToJson(UrlHelper url)
        {
            return new
            {
                Title,
                MinZoom,
                MaxZoom,
                Latitude = Position.Latitude.TotalDegrees,
                Longitude = Position.Longitude.TotalDegrees,
                InfoLoaderUrl = url.Action(InfoLoaderAction),
                IconUrl = IconLoaderAction == null ? DefaultIconUrl : url.Action(IconLoaderAction)
            };
        }
    }
}