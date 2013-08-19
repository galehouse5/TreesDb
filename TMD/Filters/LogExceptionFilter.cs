using Elmah;
using System;
using System.Diagnostics;
using System.Web;
using System.Web.Mvc;

namespace TMD.Filters
{
    public class LogExceptionFilter : FilterAttribute, IExceptionFilter
    {
        public void OnException(ExceptionContext filterContext)
        {
            if (!filterContext.HttpContext.IsCustomErrorEnabled) return;

            try
            {
                ErrorLog log = ErrorLog.GetDefault(HttpContext.Current);
                Error error = new Error(filterContext.Exception, HttpContext.Current) { ApplicationName = log.ApplicationName };
                log.Log(error);
            }
            catch (Exception ex)
            {
                Trace.WriteLine(ex);
            }
        }
    }
}