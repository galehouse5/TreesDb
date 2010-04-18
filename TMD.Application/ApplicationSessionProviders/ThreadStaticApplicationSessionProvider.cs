using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;

namespace TMD.Application.ApplicationSessionProviders
{
    public class ThreadStaticApplicationSessionProvider : ApplicationSessionProvider
    {
        [ThreadStatic]
        private static Dictionary<string, object> s_Store;

        private static Dictionary<string, object> Store
        {
            get
            {
                if (s_Store == null)
                {
                    s_Store = new Dictionary<string, object>();
                }
                return s_Store;
            }
        }

        public override bool Contains(string key)
        {
            return Store.ContainsKey(key);
        }

        public override T Get<T>(string key)
        {
            return (T)Store[key];
        }

        public override void Set(string key, object value)
        {
            Store[key] = value;
        }

        public override bool Delete(string key)
        {
            return Store.Remove(key);
        }
    }
}
