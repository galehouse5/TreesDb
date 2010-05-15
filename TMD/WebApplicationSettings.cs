using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.Configuration;

namespace TMD
{
    public class WebApplicationSettings : ConfigurationSection
    {
        private const string GoogleApiKeyPropertyName = "googleApiKey";

        [ConfigurationProperty(GoogleApiKeyPropertyName, IsRequired = true)]
        public string GoogleApiKey
        {
            get { return (string)this[GoogleApiKeyPropertyName]; }
            set { this[GoogleApiKeyPropertyName] = value; }
        }
    }
}