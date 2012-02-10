using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;

namespace TMD.Models
{
    public class ErrorModel
    {
        public class CompatibleBrowser
        {
            public readonly string Browser;
            public readonly int MajorVersion;
            public readonly string DownloadUrl;
            public readonly bool IncludeFutureMajorVersions;
            public readonly string DisplayName;
            public readonly bool IsRecommended;

            public CompatibleBrowser(string browser, int majorVersion, string downloadUrl = null, bool includeFutureMajorVersions = false, string displayName = null, bool isRecommended = false)
            {
                this.Browser = browser;
                this.MajorVersion = majorVersion;
                this.DownloadUrl = downloadUrl;
                this.IncludeFutureMajorVersions = includeFutureMajorVersions;
                this.DisplayName = displayName;
                this.IsRecommended = isRecommended;
            }

            public bool Is(HttpBrowserCapabilitiesBase browser)
            {
                if (!browser.Browser.Equals(Browser))
                {
                    return false;
                }
                if (IncludeFutureMajorVersions)
                {
                    return browser.MajorVersion >= MajorVersion;
                }
                return browser.MajorVersion == MajorVersion;
            }
        }
    }
}