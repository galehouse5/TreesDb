using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.Configuration;

namespace TMD
{
    public class TMDSettings : ConfigurationSection
    {
        private const string EnforceSecureConnectionPropertyName = "enforceSecureConnection";

        [ConfigurationProperty(EnforceSecureConnectionPropertyName, IsRequired = false, DefaultValue = false)]
        public bool EnforceSecureConnection
        {
            get { return (bool)this[EnforceSecureConnectionPropertyName]; }
            set { this[EnforceSecureConnectionPropertyName] = value; }
        }
    }
}