using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Diagnostics;
using TMD.Model.Imports;

namespace TMD.Model.Sites
{
    [DebuggerDisplay("{Name}")]
    public class SiteVisit : IEntity
    {
        protected SiteVisit()
        { }
        
        public virtual int Id { get; private set; }
        public Trip ImportingTrip { get; private set; }
        public DateTime Visited { get; private set; }
        public string Name { get; private set; }
        public Coordinates Coordinates { get; private set; }
        public Coordinates CalculatedCoordinates { get; private set; }
        public string Comments { get; private set; }

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
                Comments = importedSite.Comments
            };
        }
    }
}
