using System;
using System.Collections.Generic;
using System.ComponentModel;
using System.ComponentModel.DataAnnotations;
using TMD.Extensions;
using TMD.Model;

namespace TMD.Models.Browse
{
    public class BrowseSiteVisitModel
    {
        [DisplayFormat(DataFormatString = "{0:MM/dd/yyyy}")]
        public DateTime Visited { get; set; }
        [DataType(DataType.Url), DisplayName("Trip report url"), DisplayFormat(NullDisplayText = "(none)"), Emphasize(false)]
        public string TripReportUrl { get; set; }
        [UIHint("ConcatenatedNames"), Emphasize(false)]
        public IList<Name> Visitors { get; set; }
        [DisplayName("General comments"), DisplayFormat(NullDisplayText = "(none)"), Emphasize(false), Classification("Comment")]
        public string Comments { get; set; }
    }
}