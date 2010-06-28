using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Configuration;

namespace TMD.Model
{
    internal class ModelSettings : ConfigurationSection
    {
        private const string UnitOfWorkContextProviderPropertyName = "unitOfWorkContextProvider";
        private const string UnitOfWorkProviderPropertyName = "unitOfWorkProvider";
        private const string UserSessionContextProviderPropertyName = "userSessionContextProvider";
        private const string UserSessionProviderPropertyName = "userSessionProvider";

        [ConfigurationProperty(UnitOfWorkProviderPropertyName, IsRequired = true)]
        public string UnitOfWorkProvider
        {
            get { return (string)this[UnitOfWorkProviderPropertyName]; }
            set { this[UnitOfWorkProviderPropertyName] = value; }
        }

        [ConfigurationProperty(UnitOfWorkContextProviderPropertyName, IsRequired = true)]
        public string UnitOfWorkContextProvider
        {
            get { return (string)this[UnitOfWorkContextProviderPropertyName]; }
            set { this[UnitOfWorkContextProviderPropertyName] = value; }
        }

        [ConfigurationProperty(UserSessionProviderPropertyName, IsRequired = true)]
        public string UserSessionProvider
        {
            get { return (string)this[UserSessionProviderPropertyName]; }
            set { this[UserSessionProviderPropertyName] = value; }
        }

        [ConfigurationProperty(UserSessionContextProviderPropertyName, IsRequired = true)]
        public string UserSessionContextProvider
        {
            get { return (string)this[UserSessionContextProviderPropertyName]; }
            set { this[UserSessionContextProviderPropertyName] = value; }
        }
    }
}
