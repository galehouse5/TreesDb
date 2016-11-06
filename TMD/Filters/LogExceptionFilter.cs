using Elmah;
using System.Web.Mvc;

namespace TMD.Filters
{
    public class LogExceptionFilter : FilterAttribute, IExceptionFilter
    {
        public void OnException(ExceptionContext filterContext)
        {
            if (filterContext.IsChildAction
                || !filterContext.HttpContext.IsCustomErrorEnabled)
                return;

            ErrorSignal.FromCurrentContext().Raise(filterContext.Exception);
        }
    }
}