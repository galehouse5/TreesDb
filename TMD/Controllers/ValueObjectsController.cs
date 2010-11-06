using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.Web.Mvc;
using TMD.Model;

namespace TMD.Controllers
{
    [CheckBrowserCompatibilityFilter]
    public class ValueObjectsController : ControllerBase
    {
        [HttpGet]
        public ActionResult CreateCoordinates(string latitude, string longitude)
        {
            Coordinates c = Coordinates.Create(latitude, longitude);
            return Json(new
            {
                IsValid = c.IsValid,
                IsSpecified = c.IsSpecified,
                InputFormat = c.InputFormat.ToString(),
                LatitudeDegrees = c.Latitude.TotalDegrees,
                Latitude = c.Latitude.ToString(),
                LongitudeDegrees = c.Longitude.TotalDegrees,
                Longitude = c.Longitude.ToString()
            }, JsonRequestBehavior.AllowGet);
        }

        [HttpGet]
        public ActionResult CreateCoordinatesWithFormat(float latitude, float longitude, string format)
        {
            CoordinatesFormat typedFormat = (CoordinatesFormat)Enum.Parse(typeof(CoordinatesFormat), format);
            Coordinates c = Coordinates.Create(latitude, longitude, typedFormat);
            return Json(new
            {
                IsValid = c.IsValid,
                IsSpecified = c.IsSpecified,
                InputFormat = c.InputFormat.ToString(),
                LatitudeDegrees = c.Latitude.TotalDegrees,
                Latitude = c.Latitude.ToString(),
                LongitudeDegrees = c.Longitude.TotalDegrees,
                Longitude = c.Longitude.ToString()
            }, JsonRequestBehavior.AllowGet);
        }
    }
}
