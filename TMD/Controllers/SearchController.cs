using System.Collections.Generic;
using System.Linq;
using System.Web.Mvc;
using TMD.Model;
using TMD.Model.Locations;
using TMD.Model.Sites;
using TMD.Model.Trees;
using TMD.Models.Search;

namespace TMD.Controllers
{
    [CheckBrowserCompatibilityFilterAttribute]
    public partial class SearchController : ControllerBase
    {
        [ChildActionOnly, Route("search/menu-widget")]
        public virtual ActionResult MenuWidget(string term)
        {
            ViewBag.Term = term;
            return PartialView("_MenuWidget");
        }

        [ChildActionOnly, Route("search/bootstrap-menu-widget")]
        public virtual ActionResult BootstrapMenuWidget(string term)
        {
            return PartialView("_BootstrapMenuWidget", term);
        }

        [HttpGet, Route("search"), DefaultReturnUrl]
        public virtual ActionResult Index(string term)
        {
            int maxResultsPerCategory = Request.IsAjaxRequest() ? 5 : 25;

            IEnumerable<VisitedState> states = Repositories.Locations.SearchVisitedStates(term, maxResultsPerCategory + 1);
            IEnumerable<Subsite> subsites = Repositories.Sites.SearchSubsites(term, maxResultsPerCategory + 1);
            IEnumerable<GlobalMeasuredSpecies> species = Repositories.Trees.SearchMeasuredSpecies(term, maxResultsPerCategory + 1);

            bool hasAllResults = states.Count() <= maxResultsPerCategory
                && subsites.Count() <= maxResultsPerCategory
                && species.Count() <= maxResultsPerCategory;

            IEnumerable<ResultModel> model = states.Take(maxResultsPerCategory).Select(s => ResultModel.From(s, Url))
                .Union(subsites.Take(maxResultsPerCategory).Select(ss => ResultModel.From(ss, Url)))
                .Union(species.Take(maxResultsPerCategory).Select(s => ResultModel.From(s, Url)));

            if (Request.IsAjaxRequest())
            {
                if (!model.Any())
                    return Json(new ResultModel[] { ResultModel.From("No results found", term, Url) }, JsonRequestBehavior.AllowGet);

                if (!hasAllResults)
                    return Json(model.Union(new ResultModel[] { ResultModel.From("Show more results", term, Url) }), JsonRequestBehavior.AllowGet);

                return Json(model, JsonRequestBehavior.AllowGet);
            }

            ViewBag.Term = term;
            return View(model);
        }
    }
}