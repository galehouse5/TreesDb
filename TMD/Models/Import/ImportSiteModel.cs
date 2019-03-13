using System.ComponentModel;
using System.ComponentModel.DataAnnotations;
using TMD.Extensions;
using TMD.Model.Locations;
using TMD.Models.Map;

namespace TMD.Models.Import
{
    public class ImportSiteModel
    {
        public int Id { get; set; }
        [Required]
        public string Name { get; set; }
        public bool IsEditing { get; set; }
        public bool IsRemovable { get; set; }
        public bool HasOptionalError { get; set; }

        [Display(Description = "Latitude, Longitude (e.g. 41 29.959, -81 41.662 or 41.49932, -81.69437 or 41 29 57, -81 41 39)")]
        [Classification("CoordinatePicker Coordinates ShowIfJavascriptEnabled")]
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
}