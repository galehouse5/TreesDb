using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.Configuration;

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
    }
}