using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Configuration;

namespace TMD.Model
{
    public class Settings : ConfigurationSection
    {
        private class PropertyNames
        {
            public const string ForgottenPasswordAssistanceTokenLifetime = "forgottenPasswordAssistanceTokenLifetime";
            public const string PasswordLength = "passwordLength";
            public const string PasswordCharacterTypes = "passwordCharacterTypes";
            public const string FailedLoginsBeforeHumanVerification = "failedLoginsBeforeHumanVerification";
            public const string FailedLoginMemoryDuration = "failedLoginMemoryDuration";
        }

        [ConfigurationProperty(PropertyNames.ForgottenPasswordAssistanceTokenLifetime, IsRequired = false, DefaultValue = "01:00:00")]
        public TimeSpan ForgottenPasswordAssistanceTokenLifetime
        {
            get { return (TimeSpan)this[PropertyNames.ForgottenPasswordAssistanceTokenLifetime]; }
            set { this[PropertyNames.ForgottenPasswordAssistanceTokenLifetime] = value; }
        }

        [ConfigurationProperty(PropertyNames.PasswordLength, IsRequired = false, DefaultValue = 8)]
        public int PasswordLength
        {
            get { return (int)this[PropertyNames.PasswordLength]; }
            set { this[PropertyNames.PasswordLength] = value; }
        }

        [ConfigurationProperty(PropertyNames.PasswordCharacterTypes, IsRequired = false, DefaultValue = 2)]
        public int PasswordCharacterTypes
        {
            get { return (int)this[PropertyNames.PasswordCharacterTypes]; }
            set { this[PropertyNames.PasswordCharacterTypes] = value; }
        }

        [ConfigurationProperty(PropertyNames.FailedLoginsBeforeHumanVerification, IsRequired = false, DefaultValue = 3)]
        public int FailedLoginsBeforeHumanVerification
        {
            get { return (int)this[PropertyNames.FailedLoginsBeforeHumanVerification]; }
            set { this[PropertyNames.FailedLoginsBeforeHumanVerification] = value; }
        }

        [ConfigurationProperty(PropertyNames.FailedLoginMemoryDuration, IsRequired = false, DefaultValue = "01:00:00")]
        public TimeSpan FailedLoginMemoryDuration
        {
            get { return (TimeSpan)this[PropertyNames.FailedLoginMemoryDuration]; }
            set { this[PropertyNames.FailedLoginMemoryDuration] = value; }
        }
    }
}
