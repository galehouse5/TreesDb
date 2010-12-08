using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.ComponentModel;
using System.ComponentModel.DataAnnotations;
using TMD.Model.Trips;
using System.Web.Mvc;
using TMD.Model.Trees;
using TMD.Model;
using TMD.Model.Locations;

namespace TMD.Models
{
    public class ImportMenuWidgetModel
    {
        public bool IsSelected { get; set; }
        public bool CanImport { get; set; }
        public Trip LatestTrip { get; set; }
    }

    public class ImportEditMeasurerModel
    {
        public int Id { get; private set; }
        public string FirstName { get; set; }
        public string LastName { get; set; }
    }

    public class ImportEditTripModel
    {
        public int Id { get; private set; }
        [DisplayName("Trip name")] public string Name { get; set; }
        [DisplayName("Trip date")] public DateTime? Date { get; set; }
        [DisplayName("Trip website")] public string Website { get; set; }
        [DisplayName("Measurer contact")] public string MeasurerContactInfo { get; set; }
        [DisplayName("Make contact public")] public string MakeMeasurerContactInfoPublic { get; set; }
        public IList<ImportEditMeasurerModel> Measurers { get; set; }
    }
}