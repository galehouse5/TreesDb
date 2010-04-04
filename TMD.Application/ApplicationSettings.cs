using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Configuration;

namespace TMD.Application
{
    internal class ApplicationSettings : ConfigurationSection
    {
        private const string ApplicationSessionProviderPropertyName = "applicationSessionProvider";

        [ConfigurationProperty(ApplicationSessionProviderPropertyName, IsRequired = true)]
        public string ApplicationSessionProvider
        {
            get { return (string)this[ApplicationSessionProviderPropertyName]; }
            set { this[ApplicationSessionProviderPropertyName] = value; }
        }
    }
}
