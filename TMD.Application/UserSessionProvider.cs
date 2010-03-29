using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using TMD.Model;

namespace TMD.Application
{
    public delegate T InstanceCreationDelegate<T>();

    public abstract class UserSessionProvider : UnitOfWorkProvider
    {
        public abstract bool Contains(string key);
        public abstract T Get<T>(string key);
        public abstract void Set<T>(string key, T value);
        public abstract bool Delete(string key);

        public T GetOrCreate<T>(string key, T defaultValue)
        {
            if (!Contains(key))
            {
                Set<T>(key, defaultValue);
            }
            return Get<T>(key);
        }

        public T GetOrCreate<T>(string key, InstanceCreationDelegate<T> instanceCreator)
        {
            if (!Contains(key))
            {
                T instance = instanceCreator();
                Set<T>(key, instance);
            }
            return Get<T>(key);
        }
    }
}
