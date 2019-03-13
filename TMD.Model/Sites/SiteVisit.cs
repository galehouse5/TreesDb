using System;
using System.Collections.Generic;
using System.Diagnostics;
using System.Linq;
using TMD.Model.Extensions;
using TMD.Model.Imports;
using TMD.Model.Locations;
using TMD.Model.Photos;

namespace TMD.Model.Sites
{
    [DebuggerDisplay("{Name} ({Id})")]
    public class SiteVisit : IEntity
    {
        protected SiteVisit()
        { }

        public virtual int Id { get; protected set; }
        public virtual Trip ImportingTrip { get; protected set; }
        public virtual Site Site { get; protected internal set; }
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
        public virtual string TripReportUrl { get; protected set; }

        public static SiteVisit Create(Imports.Site importedSite)
        {
            importedSite.Trip.AssertIsImported();

            var visit = new SiteVisit
            {
                ImportingTrip = importedSite.Trip,
                Visited = importedSite.Trip.Date.Value,
                Name = importedSite.Name,
                State = importedSite.State,
                County = importedSite.County,
                OwnershipType = importedSite.OwnershipType,
                Coordinates = importedSite.Coordinates,
                CalculatedCoordinates = importedSite.CalculateCoordinates(),
                OwnershipContactInfo = importedSite.OwnershipContactInfo,
                MakeOwnershipContactInfoPublic = importedSite.MakeOwnershipContactInfoPublic,
                Comments = importedSite.Comments,
                Photos = new List<IPhoto>(),
                Visitors = new List<Name>(importedSite.Trip.Measurers),
                TripReportUrl = importedSite.Trip.Website
            };
            visit.Photos.AddRange(from photo in importedSite.Photos select new SiteVisitPhotoReference(photo.ToPhoto(), visit));
            return visit;
        }
    }
}
