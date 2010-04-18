using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using TMD.Application;

namespace TMD
{
    public class WebApplicationSessionProvider : ApplicationUserSessionProvider
    {
        public override bool Contains(string key)
        {
            return HttpContext.Current.Session[key] != null;
        }

        public override T Get<T>(string key)
        {
            return (T)HttpContext.Current.Session[key];
        }

        public override void Set(string key, object value)
        {
            HttpContext.Current.Session[key] = value;
        }

        public override bool Delete(string key)
        {
            if (Contains(key))
            {
                HttpContext.Current.Session[key] = null;
                return true;
            }
            return false;
        }
    }
}