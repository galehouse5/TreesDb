using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Configuration;

namespace TMD.Model.Users
{
    public class UserSettings : ConfigurationSection
    {
        private class Keys
        {
            public const string ForgottenPasswordAssistanceTokenLifetime = "forgottenPasswordAssistanceTokenLifetime";
            public const string PasswordLength = "passwordLength";
            public const string PasswordCharacterTypes = "passwordCharacterTypes";
            public const string FailedLoginsBeforeHumanVerification = "failedLoginsBeforeHumanVerification";
            public const string FailedLoginMemoryDuration = "failedLoginMemoryDuration";
        }

        [ConfigurationProperty(Keys.ForgottenPasswordAssistanceTokenLifetime, IsRequired = false, DefaultValue = "01:00:00")]
        public TimeSpan ForgottenPasswordAssistanceTokenLifetime
        {
            get { return (TimeSpan)this[Keys.ForgottenPasswordAssistanceTokenLifetime]; }
            set { this[Keys.ForgottenPasswordAssistanceTokenLifetime] = value; }
        }

        [ConfigurationProperty(Keys.PasswordLength, IsRequired = false, DefaultValue = 8)]
        public int PasswordLength
        {
            get { return (int)this[Keys.PasswordLength]; }
            set { this[Keys.PasswordLength] = value; }
        }

        [ConfigurationProperty(Keys.PasswordCharacterTypes, IsRequired = false, DefaultValue = 2)]
        public int PasswordCharacterTypes
        {
            get { return (int)this[Keys.PasswordCharacterTypes]; }
            set { this[Keys.PasswordCharacterTypes] = value; }
        }

        [ConfigurationProperty(Keys.FailedLoginsBeforeHumanVerification, IsRequired = false, DefaultValue = 3)]
        public int FailedLoginsBeforeHumanVerification
        {
            get { return (int)this[Keys.FailedLoginsBeforeHumanVerification]; }
            set { this[Keys.FailedLoginsBeforeHumanVerification] = value; }
        }

        [ConfigurationProperty(Keys.FailedLoginMemoryDuration, IsRequired = false, DefaultValue = "01:00:00")]
        public TimeSpan FailedLoginMemoryDuration
        {
            get { return (TimeSpan)this[Keys.FailedLoginMemoryDuration]; }
            set { this[Keys.FailedLoginMemoryDuration] = value; }
        }
    }
}
