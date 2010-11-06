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
            public const string RecaptchaPublicKey = "recaptchaPublicKey";
            public const string RecaptchaPrivateKey = "recaptchaPrivateKey";
            public const string HostName = "hostName";
            public const string WebmasterEmail = "webmasterEmail";
            public const string ExpiringTokensToRemember = "expiringTokensToRemember";
            public const string ExpiringTokenLifetime = "expiringTokenLifetime";
            public const string HandleControllerExceptions = "handleControllerExceptions";
        }

        [ConfigurationProperty(PropertyNames.GoogleApiKey, IsRequired = true)]
        public string GoogleApiKey
        {
            get { return (string)this[PropertyNames.GoogleApiKey]; }
            set { this[PropertyNames.GoogleApiKey] = value; }
        }

        [ConfigurationProperty(PropertyNames.RecaptchaPublicKey, IsRequired = true)]
        public string RecaptchaPublicKey
        {
            get { return (string)this[PropertyNames.RecaptchaPublicKey]; }
            set { this[PropertyNames.RecaptchaPublicKey] = value; }
        }

        [ConfigurationProperty(PropertyNames.RecaptchaPrivateKey, IsRequired = true)]
        public string RecaptchaPrivateKey
        {
            get { return (string)this[PropertyNames.RecaptchaPrivateKey]; }
            set { this[PropertyNames.RecaptchaPrivateKey] = value; }
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

        [ConfigurationProperty(PropertyNames.ExpiringTokensToRemember, DefaultValue = 5)]
        public int ExpiringTokensToRemember
        {
            get { return (int)this[PropertyNames.ExpiringTokensToRemember]; }
            set { this[PropertyNames.ExpiringTokensToRemember] = value; }
        }

        [ConfigurationProperty(PropertyNames.ExpiringTokenLifetime, DefaultValue="00:00:05")]
        public TimeSpan ExpiringTokenLifetime
        {
            get { return (TimeSpan)this[PropertyNames.ExpiringTokenLifetime]; }
            set { this[PropertyNames.ExpiringTokenLifetime] = value; }
        }

        [ConfigurationProperty(PropertyNames.HandleControllerExceptions, DefaultValue = true)]
        public bool HandleControllerExceptions
        {
            get { return (bool)this[PropertyNames.HandleControllerExceptions]; }
            set { this[PropertyNames.HandleControllerExceptions] = value; }
        }
    }
}