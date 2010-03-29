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
        private static UserSessionProvider s_UserSessionProvider;

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

        public static UserSessionProvider UserSessionProvider
        {
            get
            {
                if (s_UserSessionProvider == null)
                {
                    Type providerType = Type.GetType(ApplicationSettings.UserSessionProvider);
                    s_UserSessionProvider = (UserSessionProvider)Activator.CreateInstance(providerType);
                }
                return s_UserSessionProvider;
            }
        }
    }
}
