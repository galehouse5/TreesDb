using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Configuration;

namespace TMD.Model
{
    internal class ModelSettings : ConfigurationSection
    {
        private class Keys
        {
            public const string UnitOfWorkContextProvider = "unitOfWorkContextProvider";
            public const string UnitOfWorkProvider = "unitOfWorkProvider";
            public const string UserSessionProvider = "userSessionProvider";
        }

        [ConfigurationProperty(Keys.UnitOfWorkProvider, IsRequired = true)]
        public string UnitOfWorkProvider
        {
            get { return (string)this[Keys.UnitOfWorkProvider]; }
            set { this[Keys.UnitOfWorkProvider] = value; }
        }

        [ConfigurationProperty(Keys.UnitOfWorkContextProvider, IsRequired = true)]
        public string UnitOfWorkContextProvider
        {
            get { return (string)this[Keys.UnitOfWorkContextProvider]; }
            set { this[Keys.UnitOfWorkContextProvider] = value; }
        }

        [ConfigurationProperty(Keys.UserSessionProvider, IsRequired = true)]
        public string UserSessionProvider
        {
            get { return (string)this[Keys.UserSessionProvider]; }
            set { this[Keys.UserSessionProvider] = value; }
        }
    }
}
