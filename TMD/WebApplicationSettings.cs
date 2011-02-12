using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.Configuration;

namespace TMD
{
    public class WebApplicationSettings : ConfigurationSection
    {
        private class PropertyNames
        {
            public const string GoogleApiKey = "googleApiKey";
            public const string HostName = "hostName";
            public const string WebmasterEmail = "webmasterEmail";
            public const string HandleControllerExceptions = "handleControllerExceptions";
            public const string StaticContentVersion = "staticContentVersion";
            public const string StaticContentHostname = "staticContentHostname";
            public const string MinifyStaticContent = "minifyStaticContent";
        }

        [ConfigurationProperty(PropertyNames.GoogleApiKey, IsRequired = true)]
        public string GoogleApiKey
        {
            get { return (string)this[PropertyNames.GoogleApiKey]; }
            set { this[PropertyNames.GoogleApiKey] = value; }
        }

        [ConfigurationProperty(PropertyNames.HostName, IsRequired = true)]
        public string HostName
        {
            get { return (string)this[PropertyNames.HostName]; }
            set { this[PropertyNames.HostName] = value; }
        }

        [ConfigurationProperty(PropertyNames.WebmasterEmail, IsRequired = true)]
        public string WebmasterEmail
        {
            get { return (string)this[PropertyNames.WebmasterEmail]; }
            set { this[PropertyNames.WebmasterEmail] = value; }
        }

        [ConfigurationProperty(PropertyNames.HandleControllerExceptions, DefaultValue = true)]
        public bool HandleControllerExceptions
        {
            get { return (bool)this[PropertyNames.HandleControllerExceptions]; }
            set { this[PropertyNames.HandleControllerExceptions] = value; }
        }

        [ConfigurationProperty(PropertyNames.StaticContentVersion, DefaultValue = "")]
        public string StaticContentVersion
        {
            get { return (string)this[PropertyNames.StaticContentVersion]; }
            set { this[PropertyNames.StaticContentVersion] = value; }
        }

        [ConfigurationProperty(PropertyNames.StaticContentHostname, DefaultValue = "")]
        public string StaticContentHostname
        {
            get { return (string)this[PropertyNames.StaticContentHostname]; }
            set { this[PropertyNames.StaticContentHostname] = value; }
        }

        [ConfigurationProperty(PropertyNames.MinifyStaticContent, DefaultValue = false)]
        public bool MinifyStaticContent
        {
            get { return (bool)this[PropertyNames.MinifyStaticContent]; }
            set { this[PropertyNames.MinifyStaticContent] = value; }
        }
    }
}