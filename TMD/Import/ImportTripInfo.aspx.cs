using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.Web.UI;
using System.Web.UI.WebControls;
using TMD.Application;
using TMD.Model.Trips;

namespace TMD.Import
{
    public partial class ImportTripInfo : System.Web.UI.Page
    {
        protected void Page_Load(object sender, EventArgs e)
        {
            if (ApplicationSession.CurrentImportTrip == null)
            {
                ApplicationSession.CurrentImportTrip = Trip.Create();
            }
        }
    }
}