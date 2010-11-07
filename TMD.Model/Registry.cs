using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Configuration;
using TMD.Model.Users;

namespace TMD.Model
{
    internal static class Registry
    {
        private class SectionNames
        {
            public const string Settings = "modelSettings";
        }

        private static Settings s_ModelSettings;
        public static Settings Settings
        {
            get
            {
                if (s_ModelSettings == null)
                {
                    s_ModelSettings = (Settings)ConfigurationManager.GetSection(SectionNames.Settings);
                }
                return s_ModelSettings;
            }
        }
    }
}
