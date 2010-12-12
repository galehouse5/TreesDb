using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.Web.Mvc;
using TMD.Models;
using TMD.Model.Users;

namespace TMD.Controllers
{
    [CheckBrowserCompatibilityFilter]
    public class ExportController : ControllerBase
    {
        [ChildActionOnly]
        public ActionResult MenuWidget(bool isSelected)
        {
            return PartialView(new ExportMenuWidgetModel
            {
                IsSelected = isSelected,
                CanExport = User.IsInRole(Model.Users.UserRoles.Export)
            });
        }

        [DefaultReturnUrl, AuthorizeUser(Roles = UserRoles.Export)]
        public ActionResult Index()
        {
            return View();
        }
    }
}
