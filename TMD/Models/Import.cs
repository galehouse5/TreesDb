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

    public class ImportEditTripModel
    {
        public int Id { get; set; }
        [DisplayName("Trip name")] public string Name { get; set; }
        [DisplayName("Trip date")] public DateTime? Date { get; set; }
        [DisplayName("Trip website")] public string Website { get; set; }
        [DisplayName("Measurer contact")] public string MeasurerContactInfo { get; set; }
        [DisplayName("Make contact public")] public bool MakeMeasurerContactInfoPublic { get; set; }
        [DisplayName("First measurer")] public string FirstMeasurer { get; set; }
        [DisplayName("Second measurer")] public string SecondMeasurer { get; set; }
        [DisplayName("Third measurer")] public string ThirdMeasurer { get; set; }
    }
}