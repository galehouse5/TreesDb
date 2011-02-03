using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.Web.Mvc;
using System.Text;

namespace TMD.Extensions
{
    public static class UrlHelperExtensions
    {
        public static string VersionedContent(this UrlHelper helper, string contentPath, bool isSecure = false)
        {
            var sb = new StringBuilder(helper.Content(contentPath));
            if (!string.IsNullOrEmpty(WebApplicationRegistry.Settings.StaticResourceVersion))
            {
                sb.Append('?');
                sb.Append(WebApplicationRegistry.Settings.StaticResourceVersion);
            }
            if (!string.IsNullOrEmpty(WebApplicationRegistry.Settings.StaticResourceHostname))
            {
                sb.Insert(0, WebApplicationRegistry.Settings.StaticResourceHostname);
                sb.Insert(0, isSecure ? "https://" : "http://");
            }
            return sb.ToString();
        }
    }
}