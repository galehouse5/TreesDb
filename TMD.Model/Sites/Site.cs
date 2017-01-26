using System;
using System.Collections.Generic;
using System.Linq;
using TMD.Model.Extensions;

namespace TMD.Model.Sites
{
    public class Site : IEntity, IGeoAreaMetrics
    {
        protected Site()
        { }

        public virtual int Id { get; protected set; }
        public virtual string Name { get; protected set; }
        public virtual Coordinates Coordinates { get; protected set; }
        public virtual Coordinates CalculatedCoordinates { get; protected set; }
        public virtual RuckerIndex? ComputedRHI5 { get; protected set; }
        public virtual RuckerIndex? ComputedRHI10 { get; protected set; }
        public virtual RuckerIndex? ComputedRHI20 { get; protected set; }
        public virtual RuckerIndex? ComputedRGI5 { get; protected set; }
        public virtual RuckerIndex? ComputedRGI10 { get; protected set; }
        public virtual RuckerIndex? ComputedRGI20 { get; protected set; }
        public virtual int? ComputedTreesMeasuredCount { get; protected set; }
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
            Coordinates = CalculateCoordinates();
            CalculatedCoordinates = CalculateCalculatedCoordinates();
            VisitCount = Visits.Count;
            SubsiteCount = Subsites.Count;
            Visitors.RemoveAll().AddRange(
                (from visit in Visits
                 from visitor in visit.Visitors
                 select visitor).Distinct());
            return this;
        }

        public virtual IList<SiteVisit> Visits { get; protected set; }
        public virtual int VisitCount { get; protected set; }
        public virtual IList<Subsite> Subsites { get; protected set; }
        public virtual int SubsiteCount { get; protected set; }
        public virtual IList<Name> Visitors { get; protected set; }

        public virtual void AddSubsite(Subsite subsite)
        {
            Subsites.Add(subsite);
            subsite.Site = this;
        }

        public virtual bool RemoveSubsite(Subsite subsite)
        {
            if (Subsites.Remove(subsite))
            {
                subsite.Site = null;
                return true;
            }
            return false;
        }

        public virtual bool ContainsSingleSubsite
        {
            get { return Subsites.Count == 1; }
        }

        public virtual int TreesMeasured
        {
            get { return (from subsite in Subsites select subsite.Trees.Count).Sum(); }
        }

        public const float CoordinateMinutesEquivalenceProximity = 25f;
        public virtual bool ShouldMerge(Site otherSite)
        {
            if (!Name.Equals(otherSite.Name, StringComparison.OrdinalIgnoreCase))
                return false;

            if (CalculatedCoordinates.CalculateDistanceInMinutesTo(otherSite.CalculatedCoordinates) > CoordinateMinutesEquivalenceProximity)
                return false;

            return true;
        }

        public virtual Site Merge(Site otherSite)
        {
            Visits.AddRange(otherSite.Visits);

            foreach (Subsite subsite in otherSite.Subsites)
            {
                if (ShouldMerge(subsite))
                {
                    Merge(subsite);
                }
                else
                {
                    AddSubsite(subsite);
                }
            }

            return RecalculateProperties();
        }

        public virtual bool ShouldMerge(Subsite otherSubsite)
        {
            return Subsites.Any(ss => ss.ShouldMerge(otherSubsite));
        }

        public virtual Subsite Merge(Subsite otherSubsite)
        {
            Subsite subsite = Subsites.First(ss => ss.ShouldMerge(otherSubsite));
            return subsite.Merge(otherSubsite);
        }

        public override string ToString()
            => $"{Name} ({Id})";

        public static Site Create(Imports.Site importedSite)
        {
            importedSite.Trip.AssertIsImported();
            var site = new Site
            {
                Subsites = new List<Subsite>(),
                Visits = new List<SiteVisit> { SiteVisit.Create(importedSite) },
                Name = importedSite.Name,
                Visitors = new List<Name>()
            };
            foreach (var subsite in importedSite.Subsites.Select(importedSubsite => Subsite.Create(importedSubsite)))
            {
                site.AddSubsite(subsite);
            }
            return site.RecalculateProperties();
        }
    }
}
