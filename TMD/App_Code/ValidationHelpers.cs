using System.Web.Mvc;
using System.Web.Mvc.Html;
using System.Linq;

namespace TMD.App_Code
{
    public static class ValidationHelpers
    {
        public static MvcHtmlString ModelScopedValidationSummary2(this HtmlHelper html)
        {
            ViewDataDictionary viewData = html.ViewData;
            string prefix = viewData.TemplateInfo.HtmlFieldPrefix;
            var keys = viewData.ModelState.Keys.Where(k => k.StartsWith(prefix));
            var values = keys.Select(k => viewData.ModelState[k]);
            var errors = values.SelectMany(s => s.Errors);

            return html.Partial(@"~\Views\Shared\_ValidationSummary2.cshtml", errors);
        }

        public static MvcHtmlString ValidationSummary2(this HtmlHelper html)
        {
            ViewDataDictionary viewData = html.ViewData;
            var values = viewData.ModelState.Values;
            var errors = values.SelectMany(s => s.Errors);

            return html.Partial(@"~\Views\Shared\_ValidationSummary2.cshtml", errors);
        }
    }
}