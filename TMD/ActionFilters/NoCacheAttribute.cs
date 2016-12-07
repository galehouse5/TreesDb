using System.Web;
using System.Web.Mvc;

namespace TMD.ActionFilters
{
    public class NoCacheAttribute : ActionFilterAttribute
    {
        public override void OnActionExecuted(ActionExecutedContext filterContext)
        {
            if (filterContext.IsChildAction)
                return;

            if (filterContext.ActionDescriptor.IsDefined(typeof(OutputCacheAttribute), true)
                || filterContext.ActionDescriptor.ControllerDescriptor.IsDefined(typeof(OutputCacheAttribute), true))
                return;

            filterContext.HttpContext.Response.Cache.SetCacheability(HttpCacheability.NoCache);

            if (filterContext.HttpContext.Request.IsAjaxRequest())
            {
                filterContext.HttpContext.Response.Cache.SetNoStore();
            }
        }
    }
}