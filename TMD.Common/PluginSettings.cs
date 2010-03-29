using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Configuration;

namespace TMD.Common
{
    public class PluginCollectionSettings : ConfigurationSection
    {
        public const string ImplementationMappingsPropertyName = "implementationMappings";

        [ConfigurationProperty(ImplementationMappingsPropertyName, IsDefaultCollection = true)]
        public ImplementationMappingsCollection ImplementationMappings
        {
            get { return (ImplementationMappingsCollection)this[ImplementationMappingsPropertyName]; }
        }
    }

    public class PluginSettings : ConfigurationSection
    {
        public const string InterfacePropertyName = "interface";
        public const string ImplementationPropertyName = "implementation";

        [ConfigurationProperty(InterfacePropertyName, IsRequired = true)]
        public string Interface
        {
            get { return (string)this[InterfacePropertyName]; }
            set { this[InterfacePropertyName] = value; }
        }

        [ConfigurationProperty(ImplementationPropertyName, IsRequired = true)]
        public string Implementation
        {
            get { return (string)this[ImplementationPropertyName]; }
            set { this[ImplementationPropertyName] = value; }
        }
    }

    public class ImplementationMappingsCollection : ConfigurationElementCollection
    {
        protected override ConfigurationElement CreateNewElement()
        {
            return new ImplementationMappingElement();
        }

        protected override object GetElementKey(ConfigurationElement element)
        {
            return ((ImplementationMappingElement)element).Interface;
        }
    }

    public class ImplementationMappingElement : ConfigurationElement
    {
        public const string InterfacePropertyName = "interface";
        public const string ImplementationPropertyName = "implementation";

        [ConfigurationProperty(InterfacePropertyName, IsRequired = true)]
        public string Interface
        {
            get { return (string)this[InterfacePropertyName]; }
            set { this[InterfacePropertyName] = value; }
        }

        [ConfigurationProperty(ImplementationPropertyName, IsRequired = true)]
        public string Implementation
        {
            get { return (string)this[ImplementationPropertyName]; }
            set { this[ImplementationPropertyName] = value; }
        }
    }
}
