using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Configuration;

namespace TMD.Application
{
    public static class ApplicationRegistry
    {
        private const string ApplicationSettingsSectionName = "applicationSettings";

        private static ApplicationSettings s_ApplicationSettings;
        private static ApplicationSessionProvider s_ApplicationUserSessionProvider;

        internal static ApplicationSettings ApplicationSettings
        {
            get
            {
                if (s_ApplicationSettings == null)
                {
                    s_ApplicationSettings = (ApplicationSettings)ConfigurationManager.GetSection(ApplicationSettingsSectionName);
                }
                return s_ApplicationSettings;
            }
        }

        public static ApplicationSessionProvider ApplicationSessionProvider
        {
            get
            {
                if (s_ApplicationUserSessionProvider == null)
                {
                    Type providerType = Type.GetType(ApplicationSettings.ApplicationSessionProvider);
                    s_ApplicationUserSessionProvider = (ApplicationSessionProvider)Activator.CreateInstance(providerType);
                }
                return s_ApplicationUserSessionProvider;
            }
        }
    }
}
