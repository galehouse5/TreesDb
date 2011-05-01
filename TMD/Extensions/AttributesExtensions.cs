using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.ComponentModel;

namespace TMD.Extensions
{
    public static class AttributesExtensions
    {
        public static IDictionary<object, object> ToPropertyDictionary(this object attributes)
        {
            var values = new Dictionary<object, object>();
            if (attributes != null)
            {
                var props = TypeDescriptor.GetProperties(attributes);
                foreach (PropertyDescriptor prop in props)
                {
                    // assist in handling of html 5 data-* attributes 
                    if (prop.Name.StartsWith("data_"))
                    {
                        values.Add("data-" + prop.Name.Substring(5), prop.GetValue(attributes));
                    }
                    else
                    {
                        values.Add(prop.Name, prop.GetValue(attributes));
                    }
                }
            }
            return values;
        }
    }
}