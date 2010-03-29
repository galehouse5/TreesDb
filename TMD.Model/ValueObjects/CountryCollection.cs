using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Configuration;

namespace TMD.Model
{
    public class CountryCollection : ConfigurationElementCollection
    {
        protected override ConfigurationElement CreateNewElement()
        {
            return new CountryElement();
        }

        protected override object GetElementKey(ConfigurationElement element)
        {
            return ((CountryElement)element).Code;
        }
    }

    public class CountryElement : ConfigurationElement
    {
        public const string NamePropertyName = "name";
        public const string CodePropertyName = "code";
        public const string NECoordinatesPropertyName = "ne";
        public const string SWCoordinatesPropertyName = "sw";

        [ConfigurationProperty(NamePropertyName, IsRequired = true)]
        public string Name
        {
            get { return (string)this[NamePropertyName]; }
            set { this[NamePropertyName] = value; }
        }

        [ConfigurationProperty(CodePropertyName, IsRequired = true)]
        public string Code
        {
            get { return (string)this[CodePropertyName]; }
            set { this[CodePropertyName] = value; }
        }

        [ConfigurationProperty(NECoordinatesPropertyName, IsRequired = true)]
        public string NECoordinates
        {
            get { return (string)this[NECoordinatesPropertyName]; }
            set { this[NECoordinatesPropertyName] = value; }
        }

        [ConfigurationProperty(SWCoordinatesPropertyName, IsRequired = true)]
        public string SWCoordinates
        {
            get { return (string)this[SWCoordinatesPropertyName]; }
            set { this[SWCoordinatesPropertyName] = value; }
        }
    }
}
