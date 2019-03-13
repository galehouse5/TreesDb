using System;
using System.Collections.Generic;
using System.ComponentModel;
using System.ComponentModel.DataAnnotations;
using TMD.Extensions;
using TMD.Model;
using TMD.Model.Sites;

namespace TMD.Models.Browse
{
    public class TripLogModel
    {
        [DisplayFormat(DataFormatString = "{0:MM/dd/yyyy}")]
        public DateTime Date { get; set; }
        public int StateId { get; set; }
        public string StateName { get; set; }
        public string County { get; set; }
        public int SiteId { get; set; }
        public string SiteName { get; set; }

        [UIHint("ConcatenatedNames"), Emphasize(false), DisplayName("Measurers")]
        public IEnumerable<Name> Visitors { get; set; }

        public string TripReportUrl { get; set; }

        public static TripLogModel Create(SiteVisit visit)
            => new TripLogModel
            {
                Date = visit.Visited,
                StateId = visit.State.Id,
                StateName = visit.State.Name,
                County = visit.County,
                SiteId = visit.Site.Id,
                SiteName = visit.Site.Name,
                Visitors = visit.Visitors
            };
    }
}