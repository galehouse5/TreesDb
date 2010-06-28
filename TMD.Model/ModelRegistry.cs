using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Configuration;
using Microsoft.Practices.Unity;
using Microsoft.Practices.Unity.Configuration;
using Microsoft.Practices.EnterpriseLibrary.Validation;
using Microsoft.Practices.EnterpriseLibrary.Common.Configuration;

namespace TMD.Model
{
    internal static class ModelRegistry
    {
        private const string ModelSettingsSectionName = "modelSettings";
        private static ModelSettings s_ModelSettings;
        public static ModelSettings ModelSettings
        {
            get
            {
                if (s_ModelSettings == null)
                {
                    s_ModelSettings = (ModelSettings)ConfigurationManager.GetSection(ModelSettingsSectionName);
                }
                return s_ModelSettings;
            }
        }

        private const string RepositoryFactoryContainerName = "repositoryFactory";
        private static IUnityContainer s_Repositories;
        public static IUnityContainer RepositoryFactory
        {
            get
            {
                if (s_Repositories == null)
                {
                    s_Repositories = new UnityContainer()
                        .LoadConfiguration(RepositoryFactoryContainerName);
                }
                return s_Repositories;
            }
        }
    }
}
