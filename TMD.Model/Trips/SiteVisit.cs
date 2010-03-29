using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using TMD.Model.Sites;
using TMD.Model.Trees;

namespace TMD.Model.Trips
{
    public class SiteVisit : IEntity
    {
        public Guid Id { get; set; }
        public DateTime Created { get; set; }
        public Site Site { get; set; }
        public string OwnershipType { get; set; }
        public string OwnershipContactInfo { get; set; }
        public string SiteComments { get; set; }
        public IList<SubsiteVisit> SubsiteVisits { get; private set; }
        public IList<Measurement> Measurements { get; private set; }
    }
}
