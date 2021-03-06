﻿using System.Web;

namespace TMD.Extensions
{
    public static class SessionExtensions
    {
        public static partial class Keys
        {
            public const string PerformBrowserCheck = "performBrowserCheck";
            public const string DefaultReturnUrl = "defaultReturnUrl";
        }

        public static bool GetPerformBrowserCheck(this HttpSessionStateBase session)
        {
            return (bool)(session[Keys.PerformBrowserCheck] ?? true);
        }

        public static void SetPerformBrowserCheck(this HttpSessionStateBase session, bool performBrowserCheck)
        {
            session[Keys.PerformBrowserCheck] = performBrowserCheck;
        }

        public static string GetDefaultReturnUrl(this HttpContextBase context)
        {
            return (context.Session[Keys.DefaultReturnUrl] ?? context.Request.ApplicationPath).ToString();
        }

        public static void SetDefaultReturnUrl(this HttpSessionStateBase session, string defaultReturnUrl)
        {
            session[Keys.DefaultReturnUrl] = defaultReturnUrl;
        }

        public static void ClearRegardingUserSpecificData(this HttpSessionStateBase session)
        {
            // do nothing for now because there isn't currently any user specific data stored in session
        }
    }
}