using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.ComponentModel;
using System.Collections.Specialized;
using System.Text;

namespace TMD.Extensions
{
    public static class NameValueCollectionExtensions
    {
        public static string ToQueryString(this NameValueCollection collection)
        {
            StringBuilder queryString = new StringBuilder();
            foreach (string name in collection)
            {
                if (queryString.Length > 0)
                {
                    queryString.Append('&');
                }
                queryString.Append(HttpUtility.UrlEncode(name));
                queryString.Append('=');
                queryString.Append(HttpUtility.UrlEncode(collection[name]));
            }
            return queryString.ToString();
        }
    }
}