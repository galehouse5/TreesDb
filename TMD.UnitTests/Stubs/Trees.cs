using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using TMD.Model;
using TMD.Model.Photos;

namespace TMD.UnitTests.Stubs
{
    public class ImportedTripStub : TMD.Model.Imports.Trip
    {
        public ImportedTripStub() { Sites = new List<TMD.Model.Imports.Site>(); }
        public override bool IsImported { get { return true; } }
    }

    public class ImportedSiteStub : TMD.Model.Imports.Site
    {
        public ImportedSiteStub(TMD.Model.Imports.Trip trip)
        {
            this.Trip = trip;
            Subsites = new List<TMD.Model.Imports.Subsite>();
        }
    }

    public class ImportedSubsiteStub : TMD.Model.Imports.Subsite
    {
        public ImportedSubsiteStub(TMD.Model.Imports.Site site)
        {
            this.Site = site;
            Trees = new List<TMD.Model.Imports.TreeBase>();
            Photos = new List<IPhoto>();
        }
    }

    public class ImportedTreeStub : TMD.Model.Imports.TreeBase
    {
        public ImportedTreeStub(TMD.Model.Imports.Subsite subsite)
        {
            this.Subsite = subsite;
            Height = Distance.Null();
            Girth = Distance.Null();
            CrownSpread = Distance.Null();
            Elevation = Elevation.Null();
            Photos = new List<IPhoto>();
        }
    }
}
