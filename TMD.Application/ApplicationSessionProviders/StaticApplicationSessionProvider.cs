using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;

namespace TMD.Application.ApplicationSessionProviders
{
    public class StaticApplicationSessionProvider : ApplicationSessionProvider
    {
        private static Dictionary<string, object> s_Store = new Dictionary<string, object>();

        public override bool Contains(string key)
        {
            return s_Store.ContainsKey(key);
        }

        public override T Get<T>(string key)
        {
            return (T)s_Store[key];
        }

        public override void Set(string key, object value)
        {
            s_Store[key] = value;
        }

        public override bool Delete(string key)
        {
            return s_Store.Remove(key);
        }
    }
}
