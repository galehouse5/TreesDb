using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.Web.Mvc;
using System.Text;

namespace TMD.Extensions
{
    public static class StaticResourceExtensions
    {
        public static string QualifyStaticResourceRelativeUrl(this string relativeUrl, bool isSecure = false)
        {
            var sb = new StringBuilder(relativeUrl);
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

        public static string VersionedLink(this HtmlHelper html, string href, object htmlAttributes, bool isSecure = false)
        {
            TagBuilder tb = new TagBuilder("link");
            tb.MergeAttribute("href", href.QualifyStaticResourceRelativeUrl(isSecure));
            tb.MergeAttributes(htmlAttributes.ToPropertyHash(), false);
            return tb.ToString(TagRenderMode.SelfClosing);
        }

        public static string VersionedScript(this HtmlHelper html, string src, object htmlAttributes, bool isSecure = false)
        {
            TagBuilder tb = new TagBuilder("script");
            tb.MergeAttribute("src", src.QualifyStaticResourceRelativeUrl(isSecure));
            tb.MergeAttributes(htmlAttributes.ToPropertyHash(), false);
            return tb.ToString();
        }
    }
}