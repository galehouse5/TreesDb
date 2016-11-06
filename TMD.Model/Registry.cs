using System.Configuration;

namespace TMD.Model
{
    internal static class Registry
    {
        private static Settings settings;
        public static Settings Settings => settings
            ?? (settings = (Settings)ConfigurationManager.GetSection("modelSettings"));
    }
}
