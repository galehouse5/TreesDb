using System;
using System.Collections.Generic;
using System.ComponentModel;
using System.ComponentModel.DataAnnotations;

namespace TMD.Models.Import
{
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
}