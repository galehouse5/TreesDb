using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Configuration;

namespace TMD.Model
{
    internal class ModelSettings : ConfigurationSection
    {
        private const string UnitOfWorkProviderPropertyName = "unitOfWorkProvider";
        private const string UserSessionProviderPropertyName = "userSessionProvider";
        private const string StatesPropertyName = "states";
        private const string CountriesPropertyName = "countries";

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

        [ConfigurationProperty(UnitOfWorkProviderPropertyName, IsRequired = true)]
        public string UnitOfWorkProvider
        {
            get { return (string)this[UnitOfWorkProviderPropertyName]; }
            set { this[UnitOfWorkProviderPropertyName] = value; }
        }

        [ConfigurationProperty(UserSessionProviderPropertyName, IsRequired = true)]
        public string UserSessionProvider
        {
            get { return (string)this[UserSessionProviderPropertyName]; }
            set { this[UserSessionProviderPropertyName] = value; }
        }
    }
}
