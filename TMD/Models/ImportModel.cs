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

    public class ImportTripModel
    {
        public int Id { get; set; }
        [DisplayName("Trip name")] public string Name { get; set; }
        [DisplayName("Trip date")] public DateTime? Date { get; set; }
        [DisplayName("Measurer contact")] public string MeasurerContactInfo { get; set; }
        [DisplayName("Make contact public")] public bool MakeMeasurerContactInfoPublic { get; set; }
        [DisplayName("First measurer")] public string FirstMeasurer { get; set; }
        [DisplayName("Second measurer")] public string SecondMeasurer { get; set; }
        [DisplayName("Third measurer")] public string ThirdMeasurer { get; set; }
    }

    public class ImportSitesModel
    {
        public int Id { get; set; }
        public IList<ImportSiteModel> Sites { get; set; }
    }

    public class ImportSiteModel
    {
        public int Id { get; set; }
        [DisplayName("Site name")] public string Name { get; set; }
        public string Coordinates { get; set; }
        public string Comments { get; set; }
        public bool IsEditing { get; set; }
        public bool IsSaveableAndRemovable { get; set; }
        public IList<ImportSubsiteModel> Subsites { get; set; }
    }

    public class ImportSubsiteModel
    {
        public int Id { get; set; }
        [DisplayName("Subsite name")] public string Name { get; set; }
        public string Coordinates { get; set; }
        public State State { get; set; }
        public string County { get; set; }
        [DisplayName("Ownership type")] public string OwnershipType { get; set; }
        [DisplayName("Ownership contact")] public string OwnershipContactInfo { get; set; }
        [DisplayName("Make contact public")] public bool MakeOwnershipContactInfoPublic { get; set; }
        public string Comments { get; set; }
    }
}