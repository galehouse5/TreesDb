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
}