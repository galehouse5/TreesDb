using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.Web.UI;
using System.Web.UI.WebControls;
using System.Web.UI.HtmlControls;

namespace TMD
{
    public partial class TMDSite : System.Web.UI.MasterPage
    {
        public bool IncludeMaps { get; set; }
        public bool RequireJavascript { get; set; }
        public bool RequireSecureConnection { get; set; }

        public TMDSite()
        {
            IncludeMaps = false;
            RequireJavascript = true;
            RequireSecureConnection = false;
        }

        protected void Page_Load(object sender, EventArgs e)
        {
            if (TMDRegistry.Settings.EnforceSecureConnection)
            {
                if (RequireSecureConnection && !Request.IsSecureConnection)
                {
                    Response.Redirect(string.Format("{0}s://{1}{2}", Request.Url.Scheme, Request.Url.Authority, Request.Url.PathAndQuery));
                }
                else if (!RequireSecureConnection && Request.IsSecureConnection)
                {
                    Response.Redirect(string.Format("{0}://{1}{2}", Request.Url.Scheme.TrimEnd('s'), Request.Url.Authority, Request.Url.PathAndQuery));
                }
            }
            string requestUrl = ResolveUrl(Request.Path);
            foreach (Control control in ulMenu.Controls)
            {
                HtmlAnchor menuLink = control as HtmlAnchor;
                if (menuLink != null)
                {
                    if (ResolveUrl(menuLink.HRef).Equals(requestUrl, StringComparison.CurrentCultureIgnoreCase))
                    {
                        menuLink.Attributes.Add("class", "selected");
                    }
                }
            }
        }
    }
}