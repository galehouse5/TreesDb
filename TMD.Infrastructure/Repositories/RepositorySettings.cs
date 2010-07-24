using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Configuration;

namespace TMD.Infrastructure.Repositories
{
    public class RepositorySettings : ConfigurationSection
    {
        private class PropertyNames
        {
            public const string KnownTreeAcceptedSymbolComparisonExpression = "knownTreeAcceptedSymbolComparisonExpression";
            public const string KnownTreeCommonNameComparisonExpression = "knownTreeCommonNameComparisonExpression";
            public const string KnownTreeScientificNameComparisonExpression = "knownTreeScientificNameComparisonExpression";
        }

        [ConfigurationProperty(PropertyNames.KnownTreeAcceptedSymbolComparisonExpression, IsRequired = false, DefaultValue = "equality * 100")]
        public string KnownTreeAcceptedSymbolComparisonExpression
        {
            get { return (string)this[PropertyNames.KnownTreeAcceptedSymbolComparisonExpression]; }
            set { this[PropertyNames.KnownTreeAcceptedSymbolComparisonExpression] = value; }
        }

        [ConfigurationProperty(PropertyNames.KnownTreeCommonNameComparisonExpression, IsRequired = false, DefaultValue = "jaro * firstlength * 2")]
        public string KnownTreeCommonNameComparisonExpression
        {
            get { return (string)this[PropertyNames.KnownTreeCommonNameComparisonExpression]; }
            set { this[PropertyNames.KnownTreeCommonNameComparisonExpression] = value; }
        }

        [ConfigurationProperty(PropertyNames.KnownTreeScientificNameComparisonExpression, IsRequired = false, DefaultValue = "jarowinkler * firstlength")]
        public string KnownTreeScientificNameComparisonExpression
        {
            get { return (string)this[PropertyNames.KnownTreeScientificNameComparisonExpression]; }
            set { this[PropertyNames.KnownTreeScientificNameComparisonExpression] = value; }
        }
    }
}
