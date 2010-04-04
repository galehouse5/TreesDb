using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using TMD.Common;
using System.Configuration;
using TMD.Model.Users;

namespace TMD.Model
{
    public static class ModelRegistry
    {
        private const string RepositorySettingsSectionName = "repositorySettings";
        private const string ModelSettingsSectionName = "modelSettings";

        private static PluginFactory s_Repositories;
        private static ModelSettings s_ModelSettings;
        private static IUnitOfWork s_UnitOfWork;
        private static IUserSession s_UserSession;

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

        public static IUnitOfWork UnitOfWork
        {
            get
            {
                if (s_UnitOfWork == null)
                {
                    Type unitOfWorkProviderType = Type.GetType(ModelRegistry.ModelSettings.UnitOfWorkProvider);
                    s_UnitOfWork = (IUnitOfWork)Activator.CreateInstance(unitOfWorkProviderType);
                }
                return s_UnitOfWork;
            }
        }

        public static IUserSession UserSession
        {
            get
            {
                if (s_UserSession == null)
                {
                    Type userSessionProviderType = Type.GetType(ModelRegistry.ModelSettings.UserSessionProvider);
                    s_UserSession = (IUserSession)Activator.CreateInstance(userSessionProviderType);
                }
                return s_UserSession;
            }
        }
    }
}
