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
            for (int i = 0; i < collection.Count; i++)
            {
                if (queryString.Length > 0)
                {
                    queryString.Append('&');
                }
                queryString.Append(HttpUtility.UrlEncode(collection.Keys[i]));
                queryString.Append('=');
                queryString.Append(HttpUtility.UrlEncode(collection[i]));
            }
            return queryString.ToString();
        }

        public static NameValueCollection Merge(this NameValueCollection firstCollection, NameValueCollection secondCollection, bool overwrite = false)
        {
            NameValueCollection mergedCollection = new NameValueCollection(firstCollection);
            for (int i = 0; i < secondCollection.Count; i++)
            {
                string key = secondCollection.Keys[i];
                if (string.IsNullOrEmpty(firstCollection[key]) || overwrite)
                {
                    mergedCollection[secondCollection.Keys[i]] = secondCollection[i];
                }
            }
            return mergedCollection;
        }
    }
}