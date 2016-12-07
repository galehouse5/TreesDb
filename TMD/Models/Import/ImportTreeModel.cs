using System.ComponentModel;
using System.ComponentModel.DataAnnotations;
using TMD.Extensions;
using TMD.Model;
using TMD.Model.Imports;

namespace TMD.Models.Import
{
    public enum EImportTreeModelEditMode { Simple, Detailed }

    public class ImportTreeModel
    {
        public int Id { get; set; }
        public bool IsEditing { get; set; }
        public EImportTreeModelEditMode EditMode { get; set; }
        public bool IsRemovable { get; set; }

        [DisplayName("Common name"), Required, Classification("CommonName")]
        public string CommonName { get; set; }

        [DisplayName("Scientific name"), Classification("ScientificName")]
        public string ScientificName { get; set; }

        [Display(Description = "Latitude, Longitude (e.g. 41 29.959, -81 41.662 or 41.49932, -81.69437 or 41 29 57, -81 41 39)")]
        [Classification("CoordinatePicker Coordinates ShowIfJavascriptEnabled")]
        public CoordinatePickerModel Coordinates { get; set; }

        [Display(Description = "(e.g. 100', 100 ft, 33.3 yd, 30.48 m, etc.)")]
        public Distance Height { get; set; }

        [DisplayName("Measurement method"), UIHint("Enum")]
        public TreeHeightMeasurementMethod? HeightMeasurementMethod { get; set; }

        [Display(Description = "Circumference (e.g. 102\", 8' 6\", 8.5', 2.591 m, etc.)")]
        public Distance Girth { get; set; }

        [Display(Name = "Crown spread", Description = "(e.g. 60', 60 ft, 20 yd, 18.288 m, etc.)")]
        public Distance CrownSpread { get; set; }

        [DisplayName("Comments"), DataType(DataType.MultilineText)]
        public string GeneralComments { get; set; }

        [Display(Description = "(e.g. 3000 ft, 1000 yd, 914.4 m, etc.)")]
        public Elevation Elevation { get; set; }

        [Classification("ShowIfJavascriptEnabled")]
        public PhotoGalleryModel Photos { get; set; }
    }
}