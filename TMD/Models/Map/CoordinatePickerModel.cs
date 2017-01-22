using System.Web.Mvc;
using TMD.Model;

namespace TMD.Models.Map
{
    public class CoordinatePickerModel
    {
        public Coordinates Coordinates { get; set; }
        public ActionResult MarkerLoaderAction { get; set; }
    }
}