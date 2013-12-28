using System;
using System.Collections.Generic;
using System.Diagnostics;
using TMD.Model.Imports;

namespace TMD.Model.Sites
{
    [DebuggerDisplay("{Name} ({Id})")]
    public class SiteVisit : IEntity
    {
        protected SiteVisit()
        { }

        public virtual int Id { get; protected set; }
        public virtual Trip ImportingTrip { get; protected set; }
        public virtual DateTime Visited { get; protected set; }
        public virtual string Name { get; protected set; }
        public virtual Coordinates Coordinates { get; protected set; }
        public virtual Coordinates CalculatedCoordinates { get; protected set; }
        public virtual string Comments { get; protected set; }
        public virtual IList<Name> Visitors { get; protected set; }
        public virtual string TripReportUrl { get; protected set; }

        public static SiteVisit Create(Imports.Site importedSite)
        {
            importedSite.Trip.AssertIsImported();
            return new SiteVisit
            {
                ImportingTrip = importedSite.Trip,
                Visited = importedSite.Trip.Date.Value,
                Name = importedSite.Name,
                Coordinates = importedSite.Coordinates,
                CalculatedCoordinates = importedSite.CalculateCoordinates(),
                Comments = importedSite.Comments,
                Visitors = new List<Name>(importedSite.Trip.Measurers),
                TripReportUrl = importedSite.Trip.Website
            };
        }
    }
}
