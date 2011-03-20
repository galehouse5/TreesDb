using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Diagnostics;
using TMD.Model.Imports;

namespace TMD.Model.Sites
{
    [DebuggerDisplay("{Name} ({Visited})")]
    public class SiteVisit : IEntity
    {
        protected SiteVisit()
        { }
        
        public virtual int Id { get; private set; }
        public virtual Trip ImportingTrip { get; private set; }
        public virtual DateTime Visited { get; private set; }
        public virtual string Name { get; private set; }
        public virtual Coordinates Coordinates { get; private set; }
        public virtual Coordinates CalculatedCoordinates { get; private set; }
        public virtual string Comments { get; private set; }
        public virtual IList<Name> Visitors { get; private set; }
        public virtual string TripReportUrl { get; private set; }

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
