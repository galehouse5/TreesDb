using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Configuration;

namespace TMD.Common
{
    public class PluginFactory
    {
        private PluginCollectionSettings m_CollectionSettings;
        private PluginSettings m_Settings;
        private bool m_IsCollection;

        public PluginFactory(string sectionName)
        {
            object section = ConfigurationManager.GetSection(sectionName);
            if (section is PluginCollectionSettings)
            {
                m_CollectionSettings = (PluginCollectionSettings)section;
                m_IsCollection = true;
            }
            else
            {
                m_Settings = (PluginSettings)section;
                m_IsCollection = false;
            }
        }

        public T Instantiate<T>()
        {
            Type interfaceType = typeof(T);
            string implementation;
            Type implementationType;

            if (m_IsCollection)
            {
                ImplementationMappingElement mapping;
                // search for a mapping on full name first
                mapping = (from ImplementationMappingElement m in m_CollectionSettings.ImplementationMappings
                           where m.Interface == interfaceType.FullName
                           select m).First();
                if (mapping == null)
                {
                    // otherwise search for a mapping on class name
                    mapping = (from ImplementationMappingElement m in m_CollectionSettings.ImplementationMappings
                               where m.Interface == interfaceType.Name
                               select m).First();
                }
                if (mapping == null)
                {
                    throw new InvalidOperationException(string.Format("Unable to instantiate type '{0}' because an implementation is not mapped.", interfaceType.FullName));
                }
                implementation = mapping.Implementation;
            }
            else
            {
                if (m_Settings.Interface != interfaceType.FullName && m_Settings.Interface != interfaceType.Name)
                {
                    throw new InvalidOperationException(string.Format("Unable to instantiate type '{0}' because an implementation is not mapped.", interfaceType.FullName));
                }
                implementation = m_Settings.Implementation;
            }

            implementationType = Type.GetType(implementation);
            if (implementationType == null)
            {
                throw new InvalidOperationException(string.Format("Unable to instantiate type '{0}' because the implementation '{1}' does not exist.", interfaceType.FullName, implementation));
            }

            T instance = (T)Activator.CreateInstance(implementationType);
            return instance;
        }
    }
}
