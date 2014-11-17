using System;
using System.Collections.Generic;
using System.Diagnostics;

namespace TMD.Model.Sites
{
    [DebuggerDisplay("{Name} ({Id})")]
    public class SiteVisit : UserCreatedEntityBase<SiteVisit>
    {
        public SiteVisit()
        {
            Visitors = new List<Name>();
        }

        public virtual int ImportingTripId { get; protected set; }

        public virtual DateTime Visited { get; set; }
        public virtual string Name { get; set; }
        public virtual Coordinates Coordinates { get; set; }
        public virtual Coordinates CalculatedCoordinates { get; set; }
        public virtual string Comments { get; set; }
        public virtual IList<Name> Visitors { get; set; }
        public virtual string TripReportUrl { get; set; }
    }
}
