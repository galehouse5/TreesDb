using System;
using System.ComponentModel;
using System.ComponentModel.DataAnnotations;
using TMD.Extensions;

namespace TMD.Models.Browse
{
    public class BrowseSubsiteDetailsModel
    {
        [ScaffoldColumn(false)]
        public int Id { get; set; }
        public string Name { get; set; }
        [DisplayFormat(NullDisplayText = "(not enough data)")]
        public float? RHI5 { get; set; }
        [DisplayFormat(NullDisplayText = "(not enough data)")]
        public float? RHI10 { get; set; }
        [DisplayFormat(NullDisplayText = "(not enough data)")]
        public float? RHI20 { get; set; }
        [DisplayFormat(NullDisplayText = "(not enough data)")]
        public float? RGI5 { get; set; }
        [DisplayFormat(NullDisplayText = "(not enough data)")]
        public float? RGI10 { get; set; }
        [DisplayFormat(NullDisplayText = "(not enough data)")]
        public float? RGI20 { get; set; }
        [DisplayName("Ownership contact"), DisplayFormat(NullDisplayText = "(no data)")]
        public string OwnershipContactInfo { get; set; }
        [ScaffoldColumn(false)]
        public bool MakeOwnershipContactInfoPublic { get; set; }
        [DisplayName("Last visit"), DisplayFormat(DataFormatString = "{0:MM/dd/yyyy}")]
        public DateTime LastVisited { get; set; }
        [DisplayName("General comments"), DisplayFormat(NullDisplayText = "(none)"), Emphasize(false), Classification("Comment")]
        public string LastVisitComments { get; set; }
    }
}