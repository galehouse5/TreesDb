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
        public bool IsEditing { get; set; }
        public bool IsSaveableAndRemovable { get; set; }

        private string m_Name;
        public string Name 
        {
            get { return HasSingleSubsite ? Subsites[0].Name : m_Name; }
            set { m_Name = value; }
        }

        private Coordinates m_Coordinates;
        public Coordinates Coordinates 
        {
            get { return HasSingleSubsite ? Subsites[0].Coordinates : m_Coordinates; }
            set { m_Coordinates = value; }
        }

        private string m_Comments;
        public string Comments 
        {
            get { return HasSingleSubsite ? Subsites[0].Comments : m_Comments; }
            set { m_Comments = value; }
        }

        public IList<ImportSubsiteModel> Subsites { get; set; }
        public bool HasSingleSubsite { get { return Subsites != null && Subsites.Count == 1; } }
    }

    public class ImportSubsiteModel
    {
        public int Id { get; set; }
        public string Name { get; set; }
        public Coordinates Coordinates { get; set; }
        public State State { get; set; }
        public string County { get; set; }
        [DisplayName("Ownership type")] public string OwnershipType { get; set; }
        [DisplayName("Ownership contact")] public string OwnershipContactInfo { get; set; }
        [DisplayName("Make contact public")] public bool MakeOwnershipContactInfoPublic { get; set; }
        public string Comments { get; set; }
    }

    public class ImportTreesModel
    {
        public int Id { get; set; }
        public IList<ImportSiteTreesModel> Sites { get; set; }
    }

    public class ImportSiteTreesModel
    {
        public int Id { get; set; }

        private string m_Name;
        public string Name
        {
            get { return HasSingleSubsite ? Subsites[0].Name : m_Name; }
            set { m_Name = value; }
        }

        public IList<ImportSubsiteTreesModel> Subsites { get; set; }
        public bool HasSingleSubsite { get { return Subsites != null && Subsites.Count == 1; } }
    }

    public class ImportSubsiteTreesModel
    {
        public int Id { get; set; }
        public string Name { get; set; }
        public IList<ImportTreeModel> Trees { get; set; }
    }

    public class ImportTreeModel
    {
        public int Id { get; set; }
        public bool IsEditing { get; set; }
        public bool IsAdvancedEditing { get; set; }
        public bool IsRemovable { get; set; }
        [DisplayName("Common name")] public string CommonName { get; set; }
        [DisplayName("Scientific name")] public string ScientificName { get; set; }
        public Coordinates Coordinates { get; set; }
        public Distance Height { get; set; }
        [DisplayName("Measurement method")] public TreeHeightMeasurementMethod HeightMeasurementMethod { get; set; } 
        public Distance Girth { get; set; }
        [DisplayName("Crown spread")] public Distance CrownSpread { get; set; }
        [DisplayName("Comments")] public string GeneralComments { get; set; }
        public Elevation Elevation { get; set; }
    }
}