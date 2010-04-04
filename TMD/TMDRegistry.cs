using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.Configuration;

namespace TMD
{
    public class TMDRegistry
    {
        private const string SettingsSectionName = "tmdSettings";

        private static TMDSettings s_Settings;

        internal static TMDSettings Settings
        {
            get
            {
                if (s_Settings == null)
                {
                    s_Settings = (TMDSettings)ConfigurationManager.GetSection(SettingsSectionName);
                }
                return s_Settings;
            }
        }
    }
}