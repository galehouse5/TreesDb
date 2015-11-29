using Elmah;
using System;
using System.Collections.Specialized;

namespace TMD
{
    public class ElmahErrorFormatter : ErrorMailHtmlFormatter
    {
        protected NameValueCollection RemovePasswords(NameValueCollection values)
        {
            NameValueCollection copy = new NameValueCollection(values);

            foreach (string key in values)
            {
                copy[key] = key.IndexOf("Password", StringComparison.OrdinalIgnoreCase) == -1 ? values[key] : "(password removed)";
            }

            return copy;
        }

        protected override void RenderCollections()
        {
            RenderCollection(Error.Cookies, "Cookies");
            RenderCollection(RemovePasswords(Error.Form), "Form Variables");
            RenderCollection(Error.QueryString, "Query String");
            RenderCollection(Error.ServerVariables, "Server Variables");
        }
    }
}
