using System.ComponentModel;
using System.ComponentModel.DataAnnotations;
using TMD.Extensions;
using TMD.Model.Locations;

namespace TMD.Models.Import
{
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
}