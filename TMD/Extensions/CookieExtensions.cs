using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.ComponentModel;
using TMD.Model;
using TMD.Model.Extensions;

namespace TMD.Extensions
{
    public static class CookieExtensions
    {
        public static partial class Keys
        {
            public const string UnitsPreference = "unitsPreference";
        }

        public static Units GetUnitsPreference(this HttpCookieCollection cookies)
        {
            if (cookies[Keys.UnitsPreference] == null)
            {
                return Units.Default;
            }
            return cookies[Keys.UnitsPreference].Value.ParseEnum(Units.Default);
        }

        public static void SetUnitsPreference(this HttpCookieCollection cookies, Units units)
        {
            HttpCookie cookie = new HttpCookie(Keys.UnitsPreference, units.ToString());
            cookie.Expires = DateTime.Now.AddYears(10);
            cookies.Add(cookie);
        }

        public static void ClearRegardingUserSpecificData(this HttpCookieCollection cookies)
        {
            // do nothing for now because there isn't currently any user specific data stored in cookies
        }
    }
}