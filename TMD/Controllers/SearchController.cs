using System.Linq;
using System.Web.Mvc;
using TMD.Model;
using TMD.Models.Search;

namespace TMD.Controllers
{
    [CheckBrowserCompatibilityFilter]
    public partial class SearchController : ControllerBase
    {
        public virtual ActionResult MenuWidget(string term)
        {
            ViewBag.Term = term;
            return PartialView("_MenuWidget");
        }

        [DefaultReturnUrl]
        public virtual ActionResult Index(string term)
        {
            int maxResultsPerCategory = Request.IsAjaxRequest() ? 5 : 25;

            var states = Repositories.Locations.SearchStates(term, maxResultsPerCategory + 1);
            var subsites = Repositories.Sites.SearchSubsites(term, maxResultsPerCategory + 1);
            var species = Repositories.Trees.SearchMeasuredSpecies(term, maxResultsPerCategory + 1);

            bool hasAllResults = states.Count() <= maxResultsPerCategory
                && subsites.Count() <= maxResultsPerCategory
                && species.Count() <= maxResultsPerCategory;
            var model = states.Take(maxResultsPerCategory).Select(s => ResultModel.From(s, Url))
                .Union(subsites.Take(maxResultsPerCategory).Select(ss => ResultModel.From(ss, Url)))
                .Union(species.Take(maxResultsPerCategory).Select(s => ResultModel.From(s, Url)));

            if (Request.IsAjaxRequest())
            {
                if (!model.Any())
                    return Json(new[] { ResultModel.From("No results found", term, Url) }, JsonRequestBehavior.AllowGet);

                if (!hasAllResults)
                    return Json(model.Union(new[] { ResultModel.From("Show more results", term, Url) }), JsonRequestBehavior.AllowGet);

                return Json(model, JsonRequestBehavior.AllowGet);
            }

            ViewBag.Term = term;
            return View(model);
        }
    }
}