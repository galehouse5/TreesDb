using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using TMD.Common;
using System.Configuration;

namespace TMD.Model
{
    public static class ModelRegistry
    {
        private const string RepositorySettingsSectionName = "repositorySettings";
        private const string ModelSettingsSectionName = "modelSettings";

        private static PluginFactory s_Repositories;
        private static ModelSettings s_ModelSettings;
        private static UnitOfWorkProvider s_UnitOfWorkProvider;

        internal static ModelSettings ModelSettings
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

        internal static PluginFactory RepositoryFactory
        {
            get
            {
                if (s_Repositories == null)
                {
                    s_Repositories = new PluginFactory(RepositorySettingsSectionName);
                }
                return s_Repositories;
            }
        }

        public static UnitOfWorkProvider UnitOfWorkProvider
        {
            get
            {
                if (s_UnitOfWorkProvider == null)
                {
                    Type unitOfWorkProviderImplementationType = Type.GetType(ModelRegistry.ModelSettings.UnitOfWorkProviderImplementation);
                    s_UnitOfWorkProvider = (UnitOfWorkProvider)Activator.CreateInstance(unitOfWorkProviderImplementationType);
                }
                return s_UnitOfWorkProvider;
            }
        }
    }
}
