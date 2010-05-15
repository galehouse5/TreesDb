using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.Web.Mvc;
using System.Text;

namespace TMD.Extensions
{
    public static class GoogleMapsExtensions
    {
        public static HtmlString LoadGoogleMapsApiV3(this HtmlHelper helper)
        {
            StringBuilder sb = new StringBuilder();
            sb.AppendLine(string.Format("<script src='http://www.google.com/jsapi?key={0}' type='text/javascript'></script>", WebApplicationRegistry.Settings.GoogleApiKey));
            sb.AppendLine("<script type='text/javascript'>google.load('maps', '3', { other_params: 'sensor=false' });</script>");
            return new HtmlString(sb.ToString());
        }
    }
}