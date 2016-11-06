using System;
using System.IO;
using System.Linq;
using System.Text;
using System.Web.Mvc;

namespace TMD.Extensions
{
    public static class UrlHelperExtensions
    {
        public static string StaticContent(this UrlHelper helper, string contentPath, DateTime? lastModifiedTime)
        {
            StringBuilder builder = new StringBuilder(helper.Content(contentPath));

            if (lastModifiedTime.HasValue)
            {
                builder.AppendFormat("?v={0:yyyyMMddHHmmss}", lastModifiedTime);
            }

            return builder.ToString().ToLower();
        }

        private static string getMinifiedContentPath(string contentPath)
        {
            if (!contentPath.Contains('.')) return null;

            string[] contentPathParts = contentPath.Split('.');
            var minifiedContentPathParts = contentPathParts
                .Take(contentPathParts.Length - 1)
                .Union(new string[] { "min", contentPathParts.Last() });
            return string.Join(".", minifiedContentPathParts);
        }

        public static string StaticContent(this UrlHelper helper, string contentPath)
        {
            string filePath = helper.RequestContext.HttpContext.Server.MapPath(contentPath);
            if (!File.Exists(filePath))
                throw new ArgumentException($"Expected content to exist at {contentPath}.", "contentPath");

            if (!helper.RequestContext.HttpContext.IsDebuggingEnabled)
            {
                string minifiedContentPath = getMinifiedContentPath(contentPath);
                if (!string.IsNullOrEmpty(minifiedContentPath))
                {
                    string minifiedFilePath = helper.RequestContext.HttpContext.Server.MapPath(minifiedContentPath);
                    filePath = File.Exists(minifiedFilePath) ? minifiedFilePath : filePath;
                }

                return helper.StaticContent(contentPath, File.GetLastWriteTimeUtc(filePath));
            }

            return helper.StaticContent(contentPath, null);
        }
    }
}