using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using TMD.Model.Extensions;
using TMD.Model.Locations;
using TMD.Model.Photos;
using TMD.Model.Trees;

namespace TMD.Model.Sites
{
    public class Site : IEntity, IGeoAreaMetrics
    {
        protected Site()
        { }

        public virtual int Id { get; protected set; }
        public virtual string Name { get; protected set; }
        public virtual State State { get; protected set; }
        public virtual string County { get; protected set; }
        public virtual string OwnershipType { get; protected set; }
        public virtual Coordinates Coordinates { get; protected set; }
        public virtual Coordinates CalculatedCoordinates { get; protected set; }
        public virtual string OwnershipContactInfo { get; protected set; }
        public virtual bool MakeOwnershipContactInfoPublic { get; protected set; }
        public virtual RuckerIndex? ComputedRHI5 { get; protected set; }
        public virtual RuckerIndex? ComputedRHI10 { get; protected set; }
        public virtual RuckerIndex? ComputedRHI20 { get; protected set; }
        public virtual RuckerIndex? ComputedRGI5 { get; protected set; }
        public virtual RuckerIndex? ComputedRGI10 { get; protected set; }
        public virtual RuckerIndex? ComputedRGI20 { get; protected set; }
        public virtual int? ComputedTreesMeasuredCount { get; protected set; }

        [DisplayFormat(DataFormatString = "{0:MM/dd/yyyy}")] // Used by "Last measurement" column of locations grid.
        public virtual DateTime? ComputedLastMeasurementDate { get; protected set; }

        public virtual bool? ComputedContainsEntityWithCoordinates { get; protected set; }

        public virtual SiteVisit LastVisit
            => (from visit in Visits
                orderby visit.Visited
                select visit)
            .Last();

        public virtual Coordinates CalculateCalculatedCoordinates()
            => (from visit in Visits
                orderby visit.Visited
                where visit.CalculatedCoordinates.IsSpecified
                select visit.CalculatedCoordinates)
            .LastOrDefault() ?? Coordinates.Null();

        public virtual Coordinates CalculateCoordinates()
            => (from visit in Visits
                orderby visit.Visited
                where visit.Coordinates.IsSpecified
                select visit.Coordinates)
            .LastOrDefault() ?? Coordinates.Null();

        public virtual Site RecalculateProperties()
        {
            OwnershipType = LastVisit.OwnershipType;
            Coordinates = CalculateCoordinates();
            CalculatedCoordinates = CalculateCalculatedCoordinates();
            OwnershipContactInfo = LastVisit.OwnershipContactInfo;
            MakeOwnershipContactInfoPublic = LastVisit.MakeOwnershipContactInfoPublic;
            Photos.RemoveAll().AddRange(from photo in LastVisit.Photos select new SitePhotoReference(photo.ToPhoto(), this));
            VisitCount = Visits.Count;
            Visitors.RemoveAll().AddRange(
                (from visit in Visits
                 from visitor in visit.Visitors
                 select visitor).Distinct());
            return this;
        }

        public virtual IList<SiteVisit> Visits { get; protected set; }
        public virtual int VisitCount { get; protected set; }
        public virtual IList<Tree> Trees { get; protected set; }
        public virtual IList<IPhoto> Photos { get; protected set; }
        public virtual IList<Name> Visitors { get; protected set; }

        public virtual void AddVisit(SiteVisit visit)
        {
            Visits.Add(visit);
            visit.Site = this;
        }

        public virtual bool RemoveVisit(SiteVisit visit)
        {
            if (Visits.Remove(visit))
            {
                visit.Site = null;
                return true;
            }
            return false;
        }

        public virtual void AddTree(Tree tree)
        {
            Trees.Add(tree);
            tree.Site = this;
        }

        public virtual bool RemoveTree(Tree tree)
        {
            if (Trees.Remove(tree))
            {
                tree.Site = null;
                return true;
            }
            return false;
        }

        public const float CoordinateMinutesEquivalenceProximity = 25f;
        public virtual bool ShouldMerge(Site otherSite)
        {
            if (!Name.Equals(otherSite.Name, StringComparison.OrdinalIgnoreCase)) return false;
            if (!State.Equals(otherSite.State) || !County.Equals(otherSite.County, StringComparison.OrdinalIgnoreCase)) return false;
            if (CalculatedCoordinates.CalculateDistanceInMinutesTo(otherSite.CalculatedCoordinates) > CoordinateMinutesEquivalenceProximity) return false;

            return true;
        }

        public virtual Site Merge(Site otherSite)
        {
            foreach (var visit in otherSite.Visits)
            {
                AddVisit(visit);
            }

            foreach (Tree tree in otherSite.Trees)
            {
                Tree sameTree = Trees.SingleOrDefault(t => t.ShouldMerge(tree));

                if (sameTree != null) { tree.Merge(sameTree); }
                else { AddTree(tree); }
            }

            return RecalculateProperties();
        }

        public override string ToString()
            => $"{Name} ({Id})";

        public static Site Create(Imports.Site importedSite)
        {
            importedSite.Trip.AssertIsImported();
            var site = new Site
            {
                Trees = new List<Tree>(),
                Visits = new List<SiteVisit>(),
                Name = importedSite.Name,
                State = importedSite.State,
                County = importedSite.County,
                Photos = new List<IPhoto>(),
                Visitors = new List<Name>()
            };
            site.AddVisit(SiteVisit.Create(importedSite));
            foreach (var tree in importedSite.Trees.Select(importedTree => Tree.Create(importedTree)))
            {
                site.AddTree(tree);
            }
            return site.RecalculateProperties();
        }
    }
}
