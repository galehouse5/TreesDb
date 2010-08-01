using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.Web.Mvc;
using TMD.Extensions;

namespace TMD.Controllers
{
    public class MainController : Controller
    {
        [HttpGet]
        [SetDefaultControllerAndActionToCurrentControllerAndActionFilter]
        public ActionResult Index()
        {
            return View();
        }

        [HttpGet]
        public ActionResult UntestedBrowser()
        {
            return View();
        }

        [HttpGet]
        public ActionResult NotFound()
        {
            return View();
        }

        [HttpGet]
        public ActionResult ServerError()
        {
            return View();
        }
    }
}
