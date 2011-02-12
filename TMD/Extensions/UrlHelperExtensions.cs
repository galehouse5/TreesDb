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
        public static string ManagedContent(this UrlHelper helper, string contentPath, string minifiedContentPath = "")
        {
            StringBuilder builder = new StringBuilder();
            if (!string.IsNullOrEmpty(minifiedContentPath) && WebApplicationRegistry.Settings.MinifyStaticContent)
            {
                builder.Append(helper.Content(minifiedContentPath));
            }
            else
            {
                builder.Append(helper.Content(contentPath));
            }
            if (!string.IsNullOrEmpty(WebApplicationRegistry.Settings.StaticContentVersion))
            {
                builder.Append('?');
                builder.Append(WebApplicationRegistry.Settings.StaticContentVersion);
            }
            if (!string.IsNullOrEmpty(WebApplicationRegistry.Settings.StaticContentHostname))
            {
                builder.Insert(0, WebApplicationRegistry.Settings.StaticContentHostname);
                builder.Insert(0, helper.RequestContext.HttpContext.Request.IsSecureConnection ? "https://" : "http://");
            }
            return builder.ToString();           
        }
    }
}