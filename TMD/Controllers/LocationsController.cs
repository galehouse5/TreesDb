using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.Web.Mvc;
using TMD.Model.Locations;
using TMD.Models;

namespace TMD.Controllers
{
    [CheckBrowserCompatibilityFilter]
    public class LocationsController : ControllerBase
    {
        [HttpGet]
        public ActionResult FindAllCountries()
        {
            List<object> countries = new List<object>();
            foreach (Country c in LocationService.FindAllCountries())
            {
                countries.Add(new
                {
                    label = string.Format("{0} ({1})", c.Name, c.Code),
                    value = c.Name
                });
            }
            return Json(countries, JsonRequestBehavior.AllowGet);
        }

        [HttpGet]
        public ActionResult FindStatesByCountryCode(string code)
        {
            List<object> states = new List<object>();
            foreach (State s in LocationService.FindStatesByCountryCode(code))
            {
                states.Add(new
                {
                    label = string.Format("{0} ({1})", s.Name, s.Code),
                    value = s.Name
                });
            }
            return Json(states, JsonRequestBehavior.AllowGet);
        }
    }
}