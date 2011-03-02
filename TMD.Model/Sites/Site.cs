using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Diagnostics;
using TMD.Model.Imports;
using TMD.Model.Extensions;

namespace TMD.Model.Sites
{
    [DebuggerDisplay("{Name}")]
    public class Site : IEntity
    {
        protected Site()
        { }

        public virtual int Id { get; private set; }
        public virtual DateTime LastVisited { get; private set; }
        public virtual string Name { get; private set; }
        public virtual Coordinates Coordinates { get; private set; }
        public virtual Coordinates CalculatedCoordinates { get; private set; }
        public virtual float? RHI5 { get; private set; }
        public virtual float? RHI10 { get; private set; }
        public virtual float? RHI20 { get; private set; }
        public virtual float? RGI5 { get; private set; }
        public virtual float? RGI10 { get; private set; }
        public virtual float? RGI20 { get; private set; }
        public virtual int TreesWithSpecifiedCoordinatesCount { get; private set; }
        public virtual SiteVisit LastVisit { get { return (from visit in Visits orderby visit.Visited select visit).Last(); } }
        public virtual Coordinates CalculateCalculatedCoordinates() { return (from visit in Visits orderby visit.Visited where visit.CalculatedCoordinates.IsSpecified select visit.CalculatedCoordinates).LastOrDefault() ?? Coordinates.Null(); }
        public virtual Coordinates CalculateCoordinates() { return (from visit in Visits orderby visit.Visited where visit.Coordinates.IsSpecified select visit.Coordinates).LastOrDefault() ?? Coordinates.Null(); }
        public virtual int CalculateTreesWithSpecifiedCoordinatesCount() { return (from ss in Subsites select ss.TreesWithSpecifiedCoordinatesCount).Sum(); }

        public virtual float? CalculateRHI(int number)
        {
            var heightsByScientificName = from subsite in Subsites from tree in subsite.Trees
                                          where tree.Height.IsSpecified
                                          group tree by tree.ScientificName into treesByScientificName
                                          select new { ScientificName = treesByScientificName.Key, Height = treesByScientificName.Max(tree => tree.Height.Feet) };
            if (heightsByScientificName.Count() < number)
            {
                return null;
            }
            var orderedHeights = from heightByScientificName in heightsByScientificName
                                 orderby heightByScientificName.Height descending
                                 select heightByScientificName.Height;
            return (float)(orderedHeights.Take(number).Sum(height => (double)height) / (double)number);
        }

        public virtual float? CalculateRGI(int number)
        {
            var girthsByScientificName = from subsite in Subsites from tree in subsite.Trees
                                         where tree.Girth.IsSpecified
                                         group tree by tree.ScientificName into treesByScientificName
                                         select new { ScientificName = treesByScientificName.Key, Girth = treesByScientificName.Max(tree => tree.Girth.Feet) };
            if (girthsByScientificName.Count() < number)
            {
                return null;
            }
            var orderedGirths = from girthByScientificName in girthsByScientificName
                                orderby girthByScientificName.Girth descending
                                select girthByScientificName.Girth;
            return (float)(orderedGirths.Take(number).Sum(height => (double)height) / (double)number);
        }

        public virtual Site RecalculateProperties()
        {
            LastVisited = LastVisit.Visited;
            Coordinates = CalculateCoordinates();
            CalculatedCoordinates = CalculateCalculatedCoordinates();
            RHI5 = CalculateRHI(5);
            RHI10 = CalculateRHI(10);
            RHI20 = CalculateRHI(20);
            RGI5 = CalculateRGI(5);
            RGI10 = CalculateRGI(10);
            RGI20 = CalculateRGI(20);
            VisitCount = Visits.Count;
            SubsiteCount = Subsites.Count;
            TreesWithSpecifiedCoordinatesCount = CalculateTreesWithSpecifiedCoordinatesCount();
            Visitors.RemoveAll().AddRange(from visit in Visits
                                          from visitor in visit.Visitors
                                          select visitor).Distinct();
            return this;
        }

        public virtual IList<SiteVisit> Visits { get; private set; }
        public virtual int VisitCount { get; private set; }
        public virtual IList<Subsite> Subsites { get; private set; }
        public virtual int SubsiteCount { get; private set; }
        public virtual IList<Name> Visitors { get; private set; }

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
        public virtual bool ShouldMerge(Site siteToMerge)
        {
            if (!Name.Equals(siteToMerge.Name, StringComparison.OrdinalIgnoreCase))
            {
                return false;
            }
            if (CalculatedCoordinates.CalculateDistanceInMinutesTo(siteToMerge.CalculatedCoordinates) > CoordinateMinutesEquivalenceProximity)
            {
                return false;
            }
            return true;
        }

        public virtual Site Merge(Site siteToMerge)
        {
            Visits.AddRange(siteToMerge.Visits);
            var subsitesToMerge = from subsiteToMerge in siteToMerge.Subsites
                                  where ShouldMerge(subsiteToMerge)
                                  select subsiteToMerge;
            subsitesToMerge.ForEach(subsite => Merge(subsite));
            var subsitesToAdd = from subsiteToAdd in siteToMerge.Subsites
                                where !ShouldMerge(subsiteToAdd)
                                select subsiteToAdd;
            subsitesToAdd.ForEach(subsite => AddSubsite(subsite));
            return RecalculateProperties();
        }

        public virtual bool ShouldMerge(Subsite subsiteToMerge)
        {
            return (from subsite in Subsites
                    where subsite.ShouldMerge(subsiteToMerge)
                    select 1).Count() > 0;
        }

        public virtual Subsite Merge(Subsite subsiteToMerge)
        {
            return (from subsite in Subsites
                    where subsite.ShouldMerge(subsiteToMerge)
                    select subsite).First().Merge(subsiteToMerge);
        }

        public static Site Create(Imports.Site importedSite)
        {
            importedSite.Trip.AssertIsImported();
            return new Site
            {
                Subsites = (from importedSubsite in importedSite.Subsites select Subsite.Create(importedSubsite)).ToList(),
                Visits = new List<SiteVisit> { SiteVisit.Create(importedSite) },
                Name = importedSite.Name,
                Visitors = new List<Name>()
            }.RecalculateProperties();
        }
    }
}
