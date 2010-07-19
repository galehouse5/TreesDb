using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.Web.Mvc;
using TMD.Extensions;

namespace TMD.Controllers
{
    [SetDefaultControllerAndActionToCurrentControllerAndActionFilter]
    public class MainController : Controller
    {
        [HttpGet]
        public ActionResult Index()
        {
            return View();
        }

        [HttpGet]
        public ActionResult UntestedBrowser()
        {
            return View();
        }
    }
}
