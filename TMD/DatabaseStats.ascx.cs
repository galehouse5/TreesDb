using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.Web.UI;
using System.Web.UI.WebControls;

namespace TMD
{
    public partial class DatabaseStats : System.Web.UI.UserControl
    {
        public int Measurements { get; private set; }
        public int Locations { get; private set; }
        public int Reporters { get; private set; }
        public int Imports { get; private set; }
        public int Users { get; private set; }
        public int States { get; private set; }

        protected void Page_Load(object sender, EventArgs e)
        {
            Measurements = 0; //MeasurementService.CountAllMeasurements();
            Locations = 0; //MeasurementService.CountAllLocations();
            Reporters = 0; //MeasurementService.CountAllReporters();
            Imports = 0; //ImportService.CountAllImports();
            Users = 0; //UserService.CountAllUsers();
            States = 0; //MeasurementService.CountAllStates();
        }
    }
}