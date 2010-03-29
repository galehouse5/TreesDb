using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Configuration;

namespace TMD.Model
{
    internal class ModelSettings : ConfigurationSection
    {
        private const string UnitOfWorkImplementationPropertyName = "unitOfWorkImplementation";
        private const string UnitOfWorkProviderImplementationPropertyName = "unitOfWorkProviderImplementation";
        private const string StatesPropertyName = "states";
        public const string CountriesPropertyName = "countires";

        [ConfigurationProperty(CountriesPropertyName, IsRequired = true)]
        public CountryCollection Countries
        {
            get { return (CountryCollection)this[CountriesPropertyName]; }
        }

        [ConfigurationProperty(StatesPropertyName, IsRequired = true)]
        public StateCollection States
        {
            get { return (StateCollection)this[StatesPropertyName]; }
        }

        [ConfigurationProperty(UnitOfWorkImplementationPropertyName, IsRequired = true)]
        public string UnitOfWorkImplementation
        {
            get { return (string)this[UnitOfWorkImplementationPropertyName]; }
            set { this[UnitOfWorkImplementationPropertyName] = value; }
        }

        [ConfigurationProperty(UnitOfWorkProviderImplementationPropertyName, IsRequired = true)]
        public string UnitOfWorkProviderImplementation
        {
            get { return (string)this[UnitOfWorkProviderImplementationPropertyName]; }
            set { this[UnitOfWorkProviderImplementationPropertyName] = value; }
        }
    }
}
