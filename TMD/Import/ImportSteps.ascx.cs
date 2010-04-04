using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.Web.UI;
using System.Web.UI.WebControls;
using System.Web.UI.HtmlControls;

namespace TMD.Import
{
    public partial class ImportSteps : System.Web.UI.UserControl
    {
        protected void Page_Load(object sender, EventArgs e)
        {
            string requestUrl = ResolveUrl(Request.Path);
            foreach (Control control in ulNavMenu.Controls)
            {
                HtmlAnchor navLink = control as HtmlAnchor;
                if (navLink != null)
                {
                    if (ResolveUrl(navLink.HRef).Equals(requestUrl, StringComparison.CurrentCultureIgnoreCase))
                    {
                        navLink.Attributes.Add("class", "selected");
                    }
                }
            }
        }
    }
}