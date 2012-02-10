using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.Configuration;
using TMD.Models;

namespace TMD
{
    public static class WebApplicationRegistry
    {
        private const string WebApplicationSettingsSectionName = "webApplicationSettings";

        private static WebApplicationSettings s_Settings;
        public static WebApplicationSettings Settings
        {
            get
            {
                if (s_Settings == null)
                {
                    s_Settings = (WebApplicationSettings)ConfigurationManager.GetSection(WebApplicationSettingsSectionName);
                }
                return s_Settings;
            }
        }


        public static readonly IEnumerable<ErrorModel.CompatibleBrowser> CompatibleBrowsers = new List<ErrorModel.CompatibleBrowser>
        {
            new ErrorModel.CompatibleBrowser("Firefox", 3, downloadUrl: "http://www.mozilla.org/en-US/firefox/fx/", includeFutureMajorVersions: true, isRecommended: true),
            new ErrorModel.CompatibleBrowser("Chrome", 16, downloadUrl: "https://www.google.com/chrome/", includeFutureMajorVersions: true, isRecommended: true),
            new ErrorModel.CompatibleBrowser("IE", 8, downloadUrl: "http://windows.microsoft.com/en-US/internet-explorer/downloads/ie", includeFutureMajorVersions: true, displayName: "Internet Explorer"),
            new ErrorModel.CompatibleBrowser("Safari", 5, downloadUrl: "http://www.apple.com/safari/download/", includeFutureMajorVersions: true)
        };
    }
}