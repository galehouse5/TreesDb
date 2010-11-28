using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.Web.Mvc;
using TMD.Extensions;
using TMD.Models;

namespace TMD.Controllers
{
    [CheckBrowserCompatibilityFilter]
    public class MainController : ControllerBase
    {
        [DefaultReturnUrl]
        [HttpGet]
        public ActionResult Index()
        {
            return View(new ModelBase { IsHome = true }.InitializeFor(User));
        }
    }
}
