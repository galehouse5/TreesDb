using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.Web.Mvc;
using System.Text;
using System.Collections;
using System.ComponentModel;

namespace TMD.Extensions
{
    public static class AttributesExtensions
    {
        public static string ToAttributeList(this object attributes)
        {
            var sb = new StringBuilder();
            if (attributes != null)
            {
                var attributeHash = attributes.ToPropertyHash();
                foreach (string attribute in attributeHash.Keys)
                {
                    sb.AppendFormat("{0}=\"{1}\" ", attribute.Replace("_", ""), attributeHash[attribute]);
                }
            }
            return sb.ToString();
        }

        public static string ToAttributeList(this object attributes, params object[] ignoreList)
        {
            var sb = new StringBuilder();
            if (attributes != null)
            {
                var attributeHash = attributes.ToPropertyHash();
                foreach (string attribute in attributeHash.Keys)
                {
                    if (!ignoreList.Contains(attribute))
                    {
                        sb.AppendFormat("{0}=\"{1}\" ", attribute.Replace("_", ""), attributeHash[attribute]);
                    }
                }
            }
            return sb.ToString();
        }

        public static IDictionary<object, object> ToPropertyHash(this object attributes)
        {
            var values = new Dictionary<object, object>();
            if (attributes != null)
            {
                var props = TypeDescriptor.GetProperties(attributes);
                foreach (PropertyDescriptor prop in props)
                {
                    values.Add(prop.Name, prop.GetValue(attributes));
                }
            }
            return values;
        }
    }
}