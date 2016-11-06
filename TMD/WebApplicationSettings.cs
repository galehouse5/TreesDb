using System.Configuration;

namespace TMD
{
    public class WebApplicationSettings : ConfigurationSection
    {
        private class PropertyNames
        {
            public const string HostName = "hostName";
            public const string WebmasterEmail = "webmasterEmail";
            public const string EnableMaintenance = "enableMaintenance";
            public const string EnableGoogleAnalytics = "enableGoogleAnalytics";
            public const string GoogleAnalyticsPropertyID = "googleAnalyticsPropertyID";
            public const string EnableBrowserCompatibilityCheck = "enableBrowserCompatibilityCheck";
            public const string GoogleApiKey = "googleApiKey";
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

        [ConfigurationProperty(PropertyNames.EnableMaintenance, IsRequired = true)]
        public bool EnableMaintenance
        {
            get { return (bool)this[PropertyNames.EnableMaintenance]; }
            set { this[PropertyNames.EnableMaintenance] = value; }
        }

        [ConfigurationProperty(PropertyNames.EnableGoogleAnalytics, IsRequired = false, DefaultValue = false)]
        public bool EnableGoogleAnalytics
        {
            get { return (bool)this[PropertyNames.EnableGoogleAnalytics]; }
            set { this[PropertyNames.EnableGoogleAnalytics] = value; }
        }

        [ConfigurationProperty(PropertyNames.GoogleAnalyticsPropertyID, DefaultValue = "")]
        public string GoogleAnalyticsPropertyID
        {
            get { return (string)this[PropertyNames.GoogleAnalyticsPropertyID]; }
            set { this[PropertyNames.GoogleAnalyticsPropertyID] = value; }
        }

        [ConfigurationProperty(PropertyNames.EnableBrowserCompatibilityCheck, IsRequired = false, DefaultValue = true)]
        public bool EnableBrowserCompatibilityCheck
        {
            get { return (bool)this[PropertyNames.EnableBrowserCompatibilityCheck]; }
            set { this[PropertyNames.EnableBrowserCompatibilityCheck] = value; }
        }

        [ConfigurationProperty(PropertyNames.GoogleApiKey, IsRequired = true)]
        public string GoogleApiKey
        {
            get { return (string)this[PropertyNames.GoogleApiKey]; }
            set { this[PropertyNames.GoogleApiKey] = value; }
        }
    }
}