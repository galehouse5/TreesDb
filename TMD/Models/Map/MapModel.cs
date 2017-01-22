using System.Web.Mvc;
using TMD.Model;

namespace TMD.Models.Map
{
    public class MapModel
    {
        public int Zoom { get; set; }
        public Coordinates Center { get; set; }
        public CoordinateBounds Bounds { get; set; }
        public ActionResult MarkerLoaderAction { get; set; }
    }
}