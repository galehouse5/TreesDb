using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Configuration;
using Microsoft.Practices.Unity;
using Microsoft.Practices.Unity.Configuration;
using Microsoft.Practices.EnterpriseLibrary.Validation;
using Microsoft.Practices.EnterpriseLibrary.Common.Configuration;
using TMD.Model.Users;

namespace TMD.Model
{
    internal static class ModelRegistry
    {
        private class SectionNames
        {
            public const string ModelSettings = "modelSettings";
            public const string RepositoryFactory = "repositoryFactory";
            public const string UserSettings = "userSettings";
        }

        private static UserSettings s_UserSettings;
        public static UserSettings UserSettings
        {
            get
            {
                if (s_UserSettings == null)
                {
                    s_UserSettings = (UserSettings)ConfigurationManager.GetSection(SectionNames.UserSettings);
                }
                return s_UserSettings;
            }
        }

        private static ModelSettings s_ModelSettings;
        public static ModelSettings Settings
        {
            get
            {
                if (s_ModelSettings == null)
                {
                    s_ModelSettings = (ModelSettings)ConfigurationManager.GetSection(SectionNames.ModelSettings);
                }
                return s_ModelSettings;
            }
        }

        private static IUnityContainer s_Repositories;
        public static IUnityContainer RepositoryFactory
        {
            get
            {
                if (s_Repositories == null)
                {
                    s_Repositories = new UnityContainer().LoadConfiguration(SectionNames.RepositoryFactory);
                }
                return s_Repositories;
            }
        }
    }
}
