using System;
using System.Configuration;

namespace TMD.Model
{
    internal static class Registry
    {
        public static TimeSpan ForgottenPasswordAssistanceTokenLifetime
            => TimeSpan.Parse(ConfigurationManager.AppSettings["ForgottenPasswordAssistanceTokenLifetime"] ?? "01:00:00");

        public static int PasswordLength
            => int.Parse(ConfigurationManager.AppSettings["PasswordLength"] ?? "8");

        public static int PasswordCharacterTypes
            => int.Parse(ConfigurationManager.AppSettings["PasswordCharacterTypes"] ?? "2");

        public static int FailedLoginsBeforeHumanVerification
            => int.Parse(ConfigurationManager.AppSettings["FailedLoginsBeforeHumanVerification"] ?? "3");

        public static TimeSpan FailedLoginMemoryDuration
            => TimeSpan.Parse(ConfigurationManager.AppSettings["FailedLoginMemoryDuration"] ?? "01:00:00");
    }
}
