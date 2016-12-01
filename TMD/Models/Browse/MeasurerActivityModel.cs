using System;
using System.ComponentModel.DataAnnotations;
using TMD.Model;
using TMD.Model.Trees;

namespace TMD.Models.Browse
{
    public class MeasurerActivityModel
    {
        public Name Name { get; set; }
        public int? SiteVisitsCount { get; set; }
        public int? TreesMeasuredCount { get; set; }

        [DisplayFormat(DataFormatString = "{0:MM/dd/yyyy}")]
        public DateTime? LastMeasurementDate { get; set; }

        public static MeasurerActivityModel Create(MeasurerActivity activity)
            => new MeasurerActivityModel
            {
                Name = activity.Name,
                SiteVisitsCount = activity.SitesVisitedCount,
                TreesMeasuredCount = activity.TreesMeasuredCount,
                LastMeasurementDate = activity.LastMeasurementDate
            };
    }
}