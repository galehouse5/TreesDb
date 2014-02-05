using System;
using System.Collections.Generic;
using System.Diagnostics;

namespace TMD.Model.Sites
{
    [DebuggerDisplay("{Name} ({Id})")]
    public class SiteVisit : IEntity
    {
        protected SiteVisit()
        { }

        public virtual int Id { get; protected set; }
        public virtual int ImportingTripId { get; protected set; }
        public virtual DateTime Visited { get; protected set; }
        public virtual string Name { get; protected set; }
        public virtual Coordinates Coordinates { get; protected set; }
        public virtual Coordinates CalculatedCoordinates { get; protected set; }
        public virtual string Comments { get; protected set; }
        public virtual IList<Name> Visitors { get; protected set; }
        public virtual string TripReportUrl { get; protected set; }
    }
}
