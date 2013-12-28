using System;
using System.Collections.Generic;
using System.Diagnostics;
using System.Linq;
using TMD.Model.Extensions;
using TMD.Model.Imports;
using TMD.Model.Locations;
using TMD.Model.Photos;
using TMD.Model.Users;

namespace TMD.Model.Sites
{
    [DebuggerDisplay("{Name} ({Id})")]
    public class SubsiteVisit : IEntity
    {
        protected SubsiteVisit()
        { }

        public virtual int Id { get; protected set; }
        public virtual Trip ImportingTrip { get; protected set; }
        public virtual Subsite Subsite { get; protected internal set; }

        public virtual DateTime Visited { get; protected set; }
        public virtual string Name { get; protected set; }
        public virtual State State { get; protected set; }
        public virtual string County { get; protected set; }
        public virtual string OwnershipType { get; protected set; }
        public virtual Coordinates Coordinates { get; protected set; }
        public virtual Coordinates CalculatedCoordinates { get; protected set; }
        public virtual string OwnershipContactInfo { get; protected set; }
        public virtual bool MakeOwnershipContactInfoPublic { get; protected set; }
        public virtual string Comments { get; protected set; }
        public virtual IList<IPhoto> Photos { get; protected set; }
        public virtual IList<Name> Visitors { get; protected set; }

        public static SubsiteVisit Create(Imports.Subsite importedSubsite)
        {
            importedSubsite.Site.Trip.AssertIsImported();
            var visit = new SubsiteVisit
            {
                ImportingTrip = importedSubsite.Site.Trip,
                Visited = importedSubsite.Site.Trip.Date.Value,
                Name = importedSubsite.Name,
                State = importedSubsite.State,
                County = importedSubsite.County,
                OwnershipType = importedSubsite.OwnershipType,
                Coordinates = importedSubsite.Coordinates,
                CalculatedCoordinates = importedSubsite.CalculateCoordinates(),
                OwnershipContactInfo = importedSubsite.OwnershipContactInfo,
                MakeOwnershipContactInfoPublic = importedSubsite.MakeOwnershipContactInfoPublic,
                Comments = importedSubsite.Comments,
                Photos = new List<IPhoto>(),
                Visitors = new List<Name>(importedSubsite.Site.Trip.Measurers)
            };
            visit.Photos.AddRange(from photo in importedSubsite.Photos select new SubsiteVisitPhotoReference(photo.ToPhoto(), visit));
            return visit;
        }
    }

    public class SubsiteVisitPhotoReference : PhotoReferenceBase
    {
        protected SubsiteVisitPhotoReference() { }
        protected internal SubsiteVisitPhotoReference(Photo photo, SubsiteVisit subsiteVisit) : base(photo) { this.SubsiteVisit = subsiteVisit; }
        public virtual SubsiteVisit SubsiteVisit { get; protected set; }
        public override bool IsAuthorizedToView(User user) { return true; }

        public override IList<Name> Photographers
        {
            get { return SubsiteVisit.ImportingTrip.Measurers; }
        }
    }
}
