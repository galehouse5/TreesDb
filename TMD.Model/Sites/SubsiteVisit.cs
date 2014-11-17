using System;
using System.Collections.Generic;
using System.Diagnostics;
using TMD.Model.Locations;
using TMD.Model.Photo;

namespace TMD.Model.Sites
{
    [DebuggerDisplay("{Name} ({Id})")]
    public class SubsiteVisit : UserCreatedEntityBase<SubsiteVisit>
    {
        public SubsiteVisit()
        {
            Photos = new List<PhotoReference>();
            Visitors = new List<Name>();
        }

        public virtual int ImportingTripId { get; protected set; }
        public virtual Subsite Subsite { get; protected internal set; }

        public virtual DateTime Visited { get; set; }
        public virtual string Name { get; set; }
        public virtual State State { get; set; }
        public virtual string County { get; set; }
        public virtual string OwnershipType { get; set; }
        public virtual Coordinates Coordinates { get; set; }
        public virtual Coordinates CalculatedCoordinates { get; set; }
        public virtual string OwnershipContactInfo { get; set; }
        public virtual bool MakeOwnershipContactInfoPublic { get; set; }
        public virtual string Comments { get; set; }
        public virtual IList<PhotoReference> Photos { get; set; }
        public virtual IList<Name> Visitors { get; set; }
    }
}
