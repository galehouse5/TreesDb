using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Configuration;

namespace TMD.Application
{
    internal class ApplicationSettings : ConfigurationSection
    {
        private const string UserSessionProviderPropertyName = "userSessionProvider";

        [ConfigurationProperty(UserSessionProviderPropertyName, IsRequired = true)]
        public string UserSessionProvider
        {
            get { return (string)this[UserSessionProviderPropertyName]; }
            set { this[UserSessionProviderPropertyName] = value; }
        }
    }
}
