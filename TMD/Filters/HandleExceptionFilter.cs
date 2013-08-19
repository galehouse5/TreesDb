using System;
using System.Collections.Generic;
using System.Web.Mvc;
using TMD.Controllers;

namespace TMD.Filters
{
    public class HandleExceptionFilter : FilterAttribute, IExceptionFilter
    {
        public void OnException(ExceptionContext filterContext)
        {
            if (!filterContext.HttpContext.IsCustomErrorEnabled) return;

            filterContext.ExceptionHandled = true;

            if (filterContext.Exception is UnauthorizedAccessException)
            {
                filterContext.Result = new UnauthorizedResult();
            }
            else if (filterContext.Exception is KeyNotFoundException)
            {
                filterContext.Result = new NotFoundResult();
            }
            else
            {
                filterContext.Result = new ServerErrorResult();
            }
        }
    }
}