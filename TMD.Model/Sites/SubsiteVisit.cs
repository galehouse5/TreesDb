﻿using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Diagnostics;
using TMD.Model.Imports;
using TMD.Model.Trees;
using TMD.Model.Locations;

namespace TMD.Model.Sites
{
    [DebuggerDisplay("{Name}")]
    public class SubsiteVisit : IEntity
    {
        protected SubsiteVisit()
        { }

        public virtual int Id { get; private set; }
        public virtual Trip ImportingTrip { get; private set; }
        public virtual DateTime Visited { get; private set; }
        public virtual string Name { get; private set; }
        public virtual State State { get; private set; }
        public virtual string County { get; private set; }
        public virtual string OwnershipType { get; private set; }
        public virtual Coordinates Coordinates { get; private set; }
        public virtual Coordinates CalculatedCoordinates { get; private set; }
        public virtual string OwnershipContactInfo { get; private set; }
        public virtual bool MakeContactInfoPublic { get; private set; }
        public virtual string Comments { get; private set; }

        public static SubsiteVisit Create(Imports.Subsite importedSubsite)
        {
            importedSubsite.Site.Trip.AssertIsImported();
            return new SubsiteVisit
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
                MakeContactInfoPublic = importedSubsite.MakeOwnershipContactInfoPublic,
                Comments = importedSubsite.Comments
            };
        }
    }
}