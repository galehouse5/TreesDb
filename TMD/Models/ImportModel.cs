using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.ComponentModel;
using System.ComponentModel.DataAnnotations;
using TMD.Model.Imports;
using System.Web.Mvc;
using TMD.Model.Trees;
using TMD.Model;
using TMD.Model.Locations;
using System.Diagnostics;
using TMD.Model.Extensions;
using TMD.Extensions;

namespace TMD.Models
{
    public class ImportMenuWidgetModel
    {
        public bool IsSelected { get; set; }
        public bool CanImport { get; set; }
        public Trip LatestTrip { get; set; }
    }

    public class ImportTripSummaryModel
    {
        [ScaffoldColumn(false)]
        public int Id { get; set; }
        public string Name { get; set; }
        [DisplayFormat(DataFormatString = "{0:MM/dd/yyyy}")]
        public virtual DateTime? Date { get; set; }
        [DisplayName("Sites")]
        public IList<string> Sites { get; set; }
        public DateTime Created { get; set; }
        public bool IsImported { get; set; }
    }

    public class ImportTripModel
    {
        public int Id { get; set; }
        [DisplayName("Trip name"), Required]
        public string Name { get; set; }
        [DisplayName("Trip date"), Required, DisplayFormat(DataFormatString = "{0:MM/dd/yyyy}", ApplyFormatInEditMode = true)]
        public DateTime? Date { get; set; }
        [DisplayName("Measurer contact"), Required, DataType(DataType.MultilineText)]
        public string MeasurerContactInfo { get; set; }
        [DisplayName("Make contact public")]
        public bool? MakeMeasurerContactInfoPublic { get; set; }
        [DisplayName("First measurer"), Display(Description = "Lastname, Firstname"), Required]
        public string FirstMeasurer { get; set; }
        [DisplayName("Second measurer"), Display(Description = "Lastname, Firstname")]
        public string SecondMeasurer { get; set; }
        [DisplayName("Third measurer"), Display(Description = "Lastname, Firstname")]
        public string ThirdMeasurer { get; set; }
        [DataType(DataType.Url), DisplayName("Trip report url")]
        public string Website { get; set; }
    }

    public static class ImportInnerActionModelExtensions
    {
        public static MvcHtmlString ImportInnerActionButton(this HtmlHelper html, string text, ImportModelLevel level, int id, ImportModelAction action,
            ButtonColor color = ButtonColor.Default, ButtonSize size = ButtonSize.Default)
        {
            return html.SubmitButton(text, "innerAction", string.Format("{0}.{1}.{2}", level, id, action), color, size);
        }
    }

    public enum ImportModelLevel { Unknown, Trip, Site, Subsite, Tree }
    public enum ImportModelAction { Unknown, Add, Save, Edit, Remove, DetailedEdit }

    [DebuggerDisplay("{Action} {Level} with Id {Id}")]
    public class ImportInnerActionModel : IModelBinder
    {
        public int Id { get; private set; }
        public ImportModelAction Action { get; private set; }
        public ImportModelLevel Level { get; private set; }

        public object BindModel(ControllerContext controllerContext, ModelBindingContext bindingContext)
        {
            string expression = bindingContext.ValueProvider.GetValue(bindingContext.ModelName).AttemptedValue;
            string[] parts = expression.Split('.');
            return new ImportInnerActionModel
            {
                Level = parts[0].ParseEnum(ImportModelLevel.Unknown),
                Id = Convert.ToInt32(parts[1]),
                Action = parts[2].ParseEnum(ImportModelAction.Unknown)
            };
        }

        public bool Equals(ImportModelLevel level, ImportModelAction action)
        {
            return this.Level == level && this.Action == action;
        }
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

        [Required]
        public string Name { get; set; }
        [Display(Description = "Latitude, Longitude"), Classification("CoordinatePicker Coordinates")]
        public CoordinatePickerModel Coordinates { get; set; }
        public string Comments { get; set; }

        public IList<ImportSubsiteModel> Subsites { get; set; }

        public ImportSubsiteModel AddSubsite()
        {
            var subsite = new ImportSubsiteModel();
            if (Subsites.Count == 1)
            {
                this.Name = Subsites[0].Name;
                this.Coordinates.Coordinates = Subsites[0].Coordinates.Coordinates;
                this.Comments = Subsites[0].Comments;
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
        [Required]
        public string Name { get; set; }
        [Display(Description = "Latitude, Longitude"), Classification("CoordinatePicker Coordinates ShowIfJavascriptEnabled")]
        public CoordinatePickerModel Coordinates { get; set; }
        [Required, Classification("State")]
        public State State { get; set; }
        [Required, Classification("County")]
        public string County { get; set; }
        [DisplayName("Ownership type"), Required]
        public string OwnershipType { get; set; }
        [DisplayName("Ownership contact"), DataType(DataType.MultilineText)]
        public string OwnershipContactInfo { get; set; }
        [DisplayName("Make contact public")]
        public bool MakeOwnershipContactInfoPublic { get; set; }
        [DataType(DataType.MultilineText)]
        public string Comments { get; set; }
        [Classification("ShowIfJavascriptEnabled")]
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
        public string Name { get; set; }
        public IList<ImportSubsiteTreesModel> Subsites { get; set; }

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

    public enum EImportTreeModelEditMode { Simple, Detailed }

    public class ImportTreeModel
    {
        public int Id { get; set; }
        public bool IsEditing { get; set; }
        public EImportTreeModelEditMode EditMode { get; set; }
        public bool IsRemovable { get; set; }
        [DisplayName("Common name"), Required, Classification("CommonName")]
        public string CommonName { get; set; }
        [DisplayName("Scientific name"), Required, Classification("ScientificName")]
        public string ScientificName { get; set; }
        [Display(Description = "Latitude, Longitude"), Classification("CoordinatePicker Coordinates ShowIfJavascriptEnabled")]
        public CoordinatePickerModel Coordinates { get; set; }
        public Distance Height { get; set; }
        [DisplayName("Measurement method"), UIHint("Enum")]
        public TreeHeightMeasurementMethod? HeightMeasurementMethod { get; set; }
        public Distance Girth { get; set; }
        [DisplayName("Crown spread")]
        public Distance CrownSpread { get; set; }
        [DisplayName("Comments"), DataType(DataType.MultilineText)]
        public string GeneralComments { get; set; }
        public Elevation Elevation { get; set; }
        [Classification("ShowIfJavascriptEnabled")]
        public PhotoGalleryModel Photos { get; set; }
    }

    public class ImportFinishedTripModel
    {
        public int Id { get; set; }
        [DisplayName("Trip name")]
        public string Name { get; set; }
        [DisplayName("Date"), DisplayFormat(DataFormatString = "{0:MM/dd/yyyy}")]
        public DateTime? Date { get; set; }
        [DisplayName("Measurer contact")]
        public string MeasurerContactInfo { get; set; }
        [DisplayName("First measurer")]
        public string FirstMeasurer { get; set; }
        [DisplayName("Second measurer")]
        public string SecondMeasurer { get; set; }
        [DisplayName("Third measurer")]
        public string ThirdMeasurer { get; set; }
        public IList<ImportFinishedSiteModel> Sites { get; set; }
    }

    public class ImportFinishedSiteModel
    {
        public string Name { get; set; }
        public IList<ImportFinishedSubsiteModel> Subsites { get; set; }
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