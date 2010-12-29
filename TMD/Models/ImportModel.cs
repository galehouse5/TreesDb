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

        public ImportSiteModel FindSiteById(int id)
        {
            return Sites.First(s => id.Equals(s.Id));
        }

        public ImportSiteModel AddSite()
        {
            var site = new ImportSiteModel();
            Sites.Add(site);
            return site;
        }

        public bool RemoveSite(ImportSiteModel site)
        {
            return Sites.Remove(site);
        }

        public ImportSubsiteModel FindSubsiteById(int id)
        {
            var site = Sites.FirstOrDefault(s => s.FindSubsiteById(id) != null);
            return site == null ? null : site.FindSubsiteById(id);
        }
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

        private CoordinatePickerModel m_Coordinates;
        public CoordinatePickerModel Coordinates 
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

        public ImportSubsiteModel AddSubsite()
        {
            var subsite = new ImportSubsiteModel();
            if (Subsites.Count == 1)
            {
                m_Name = Name;
                m_Coordinates = Coordinates;
                m_Comments = Comments;
            }
            Subsites.Add(subsite);
            return subsite;
        }

        public bool RemoveSubsite(ImportSubsiteModel subsite)
        {
            return Subsites.Remove(subsite);
        }

        public ImportSubsiteModel FindSubsiteById(int id)
        {
            return Subsites.FirstOrDefault(ss => id.Equals(ss.Id));
        }
    }

    public class ImportSubsiteModel
    {
        public int Id { get; set; }
        public string Name { get; set; }
        public CoordinatePickerModel Coordinates { get; set; }
        public State State { get; set; }
        public string County { get; set; }
        [DisplayName("Ownership type")] public string OwnershipType { get; set; }
        [DisplayName("Ownership contact")] public string OwnershipContactInfo { get; set; }
        [DisplayName("Make contact public")] public bool MakeOwnershipContactInfoPublic { get; set; }
        public string Comments { get; set; }
        public PhotoGalleryModel Photos { get; set; }
    }

    public class ImportTreesModel
    {
        public int Id { get; set; }
        public IList<ImportSiteTreesModel> Sites { get; set; }

        public ImportTreeModel FindTreeById(int id)
        {
            var site = FindSiteContainingTreeWithId(id);
            return site == null ? null : site.FindTreeById(id);
        }

        public ImportSiteTreesModel FindSiteContainingTreeWithId(int id)
        {
            return Sites.FirstOrDefault(s => s.FindTreeById(id) != null);
        }

        public ImportSubsiteTreesModel FindSubsiteContainingTreeWithId(int id)
        {
            var site = Sites.FirstOrDefault(s => s.FindSubsiteContainingTreeWithId(id) != null);
            return site == null ? null : site.FindSubsiteContainingTreeWithId(id);
        }

        public ImportSubsiteTreesModel FindSubsiteById(int id)
        {
            var site = Sites.FirstOrDefault(s => s.FindSubsiteById(id) != null);
            return site == null ? null : site.FindSubsiteById(id);
        }
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

        public ImportTreeModel FindTreeById(int id)
        {
            var subsite = FindSubsiteContainingTreeWithId(id);
            return subsite == null ? null : subsite.FindTreeById(id);
        }

        public ImportSubsiteTreesModel FindSubsiteContainingTreeWithId(int id)
        {
            return Subsites.FirstOrDefault(ss => ss.FindTreeById(id) != null);
        }

        public ImportSubsiteTreesModel FindSubsiteById(int id)
        {
            return Subsites.FirstOrDefault(ss => id.Equals(ss.Id));
        }
    }

    public class ImportSubsiteTreesModel
    {
        public int Id { get; set; }
        public string Name { get; set; }
        public IList<ImportTreeModel> Trees { get; set; }

        public ImportTreeModel FindTreeById(int id)
        {
            return Trees.FirstOrDefault(t => id.Equals(t.Id));
        }

        public ImportTreeModel AddTree()
        {
            var tree = new ImportTreeModel();
            Trees.Add(tree);
            return tree;
        }

        public bool RemoveTree(ImportTreeModel tree)
        {
            return Trees.Remove(tree);
        }
    }

    public enum EImportTreeModelEditMode { Simple, Advanced }

    public class ImportTreeModel
    {
        public ImportTreeModel()
        {
            Photos = new PhotoGalleryModel();
        }

        public int Id { get; set; }
        public bool IsEditing { get; set; }
        public EImportTreeModelEditMode EditMode { get; set; }
        public bool IsRemovable { get; set; }
        [DisplayName("Common name")] public string CommonName { get; set; }
        [DisplayName("Scientific name")] public string ScientificName { get; set; }
        public CoordinatePickerModel Coordinates { get; set; }
        public Distance Height { get; set; }
        [DisplayName("Measurement method")] public TreeHeightMeasurementMethod HeightMeasurementMethod { get; set; } 
        public Distance Girth { get; set; }
        [DisplayName("Crown spread")] public Distance CrownSpread { get; set; }
        [DisplayName("Comments")] public string GeneralComments { get; set; }
        public Elevation Elevation { get; set; }
        public PhotoGalleryModel Photos { get; set; }
    }

    public class ImportFinishedTripModel
    {
        public int Id { get; set; }
        [DisplayName("Trip name")] public string Name { get; set; }
        [DisplayName("Trip date")] public DateTime? Date { get; set; }
        [DisplayName("Measurer contact")] public string MeasurerContactInfo { get; set; }
        [DisplayName("First measurer")] public string FirstMeasurer { get; set; }
        [DisplayName("Second measurer")] public string SecondMeasurer { get; set; }
        [DisplayName("Third measurer")] public string ThirdMeasurer { get; set; }
        public IList<ImportFinishedSiteModel> Sites { get; set; }
    }

    public class ImportFinishedSiteModel
    {
        public string Name { get; set; }
        public IList<ImportFinishedSubsiteModel> Subsites { get; set; }
        public bool HasSingleSubsite { get { return Subsites != null && Subsites.Count == 1; } }
    }

    public class ImportFinishedSubsiteModel
    {
        public string Name { get; set; }
        public State State { get; set; }
        public string County { get; set; }
        [DisplayName("Ownership type")] public string OwnershipType { get; set; }
        public IList<ImportFinishedTreeModel> Trees { get; set; }
        public PhotoGalleryModel Photos { get; set; }
    }

    public class ImportFinishedTreeModel
    {
        [DisplayName("Common name")] public string CommonName { get; set; }
        [DisplayName("Scientific name")] public string ScientificName { get; set; }
        public Distance Height { get; set; }        
        public Distance Girth { get; set; }
        [DisplayName("Crown spread")] public Distance CrownSpread { get; set; }
        public PhotoGalleryModel Photos { get; set; }
    }
}