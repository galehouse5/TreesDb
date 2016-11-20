using System;
using System.ComponentModel;
using System.ComponentModel.DataAnnotations;

namespace TMD.Models.Import
{
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
}