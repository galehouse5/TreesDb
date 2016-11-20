using System;
using System.Collections.Generic;
using System.ComponentModel;
using System.ComponentModel.DataAnnotations;

namespace TMD.Models.Import
{
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
}