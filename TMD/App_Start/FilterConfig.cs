using System.Web.Mvc;
using TMD.Filters;

namespace TMD
{
    public class FilterConfig
    {
        public static void RegisterGlobalFilters(GlobalFilterCollection filters)
        {
            filters.Add(new LogExceptionFilter());
            filters.Add(new HandleExceptionFilter());
        }
    }
}