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
            if (filterContext.IsChildAction
                || filterContext.ExceptionHandled
                || !filterContext.HttpContext.IsCustomErrorEnabled)
                return;

            Exception baseException = filterContext.Exception.GetBaseException();

            if (baseException is UnauthorizedAccessException)
            {
                filterContext.Result = new UnauthorizedResult();
            }
            else if (baseException is KeyNotFoundException)
            {
                filterContext.Result = new NotFoundResult();
            }
            else
            {
                filterContext.Result = new ServerErrorResult();
            }

            filterContext.ExceptionHandled = true;
        }
    }
}