using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using TMD.Model.Trees;
using TMD.Model.Sites;

namespace TMD.Model.Trips
{
    public class SubsiteVisit
    {
        public Guid Id { get; set; }
        public DateTime Created { get; set; }
        public Subsite Subsite { get; set; }
        public IList<Measurement> Measurements { get; private set; }
    }
}
