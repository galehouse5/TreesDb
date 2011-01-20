using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Diagnostics;
using TMD.Model.Imports;
using TMD.Model.Trees;
using TMD.Model.Locations;
using TMD.Model.Extensions;
using TMD.Model.Photos;
using TMD.Model.Users;

namespace TMD.Model.Sites
{
    [DebuggerDisplay("{Name}")]
    public class Subsite : IEntity
    {
        protected Subsite()
        { }

        public virtual int Id { get; private set; }
        public virtual DateTime LastVisited { get; private set; }
        public virtual string Name { get; private set; }
        public virtual State State { get; private set; }
        public virtual string County { get; private set; }
        public virtual string OwnershipType { get; private set; }
        public virtual Coordinates Coordinates { get; private set; }
        public virtual Coordinates CalculatedCoordinates { get; private set; }
        public virtual string OwnershipContactInfo { get; private set; }
        public virtual bool MakeOwnershipContactInfoPublic { get; private set; }
        public virtual float? RHI5 { get; private set; }
        public virtual float? RHI10 { get; private set; }
        public virtual float? RHI20 { get; private set; }
        public virtual float? RGI5 { get; private set; }
        public virtual float? RGI10 { get; private set; }
        public virtual float? RGI20 { get; private set; }
        public virtual IList<IPhoto> Photos { get; private set; }
        public virtual int TreesWithSpecifiedCoordinatesCount { get; private set; }
        public virtual int VisitCount { get; private set; }
        public virtual SubsiteVisit LastVisit { get { return (from v in Visits orderby v.Visited select v).Last(); } }
        public virtual IList<Name> Visitors { get; private set; }
        
        public virtual Coordinates CalculateCoordinates() 
        { 
            return (from v in Visits orderby v.Visited where v.Coordinates.IsSpecified select v.Coordinates).LastOrDefault() ?? Coordinates.Null(); 
        }
        
        public virtual Coordinates CalculateCalculatedCoordinates() 
        { 
            return (from v in Visits orderby v.Visited where v.CalculatedCoordinates.IsSpecified select v.CalculatedCoordinates).LastOrDefault() ?? Coordinates.Null(); 
        }

        public virtual int CalculateTreesWithSpecifiedCoordinatesCount() 
        { 
            return (from t in Trees where t.Coordinates.IsSpecified select t).Count(); 
        }

        public virtual float? CalculateRHI(int number)
        {
            var heightsByScientificName = from tree in Trees
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
            var girthsByScientificName = from tree in Trees
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

        public virtual Subsite RecalculateProperties()
        {
            LastVisited = LastVisit.Visited;
            OwnershipType = LastVisit.OwnershipType;
            OwnershipContactInfo = LastVisit.OwnershipContactInfo;
            MakeOwnershipContactInfoPublic = LastVisit.MakeOwnershipContactInfoPublic;
            Coordinates = CalculateCoordinates();
            CalculatedCoordinates = CalculateCalculatedCoordinates();
            RHI5 = CalculateRHI(5);
            RHI10 = CalculateRHI(10);
            RHI20 = CalculateRHI(20);
            RGI5 = CalculateRGI(5);
            RGI10 = CalculateRGI(10);
            RGI20 = CalculateRGI(20);
            Photos.RemoveAll().AddRange(from photo in LastVisit.Photos select new SubsitePhotoReference(photo.ToPhoto(), this));
            Visitors.RemoveAll().AddRange(from visit in Visits
                                          from visitor in visit.Visitors
                                          select visitor).Distinct();
            VisitCount = Visits.Count;
            TreesWithSpecifiedCoordinatesCount = CalculateTreesWithSpecifiedCoordinatesCount();
            return this;
        }

        public virtual IList<SubsiteVisit> Visits { get; private set; }
        public virtual IEnumerable<SubsiteVisit> ChronologicalVisits { get { return from visit in Visits orderby visit.Visited descending select visit; } }
        public virtual IList<Tree> Trees { get; private set; }

        public const float CoordinateMinutesEquivalenceProximity = 5f;
        public virtual bool ShouldMerge(Subsite subsiteToMerge)
        {
            if (!Name.Equals(subsiteToMerge.Name, StringComparison.OrdinalIgnoreCase))
            {
                return false;
            }
            if (!State.Equals(subsiteToMerge.State) || !County.Equals(subsiteToMerge.County, StringComparison.OrdinalIgnoreCase))
            {
                return false;
            }
            if (CalculatedCoordinates.CalculateDistanceInMinutesTo(subsiteToMerge.CalculatedCoordinates) > CoordinateMinutesEquivalenceProximity)
            {
                return false;
            }
            return true;
        }

        public virtual Subsite Merge(Subsite subsiteToMerge)
        {
            Visits.AddRange(subsiteToMerge.Visits);
            var treesToMerge = from treeToMerge in subsiteToMerge.Trees
                               where ShouldMerge(treeToMerge)
                               select treeToMerge;
            treesToMerge.ForEach(tree => Merge(tree));
            var treesToAdd = from treeToAdd in subsiteToMerge.Trees
                             where !ShouldMerge(treeToAdd)
                             select treeToAdd;
            treesToAdd.ForEach(tree => Trees.Add(tree));
            return RecalculateProperties();
        }

        public virtual bool ShouldMerge(Tree treeToMerge)
        {
            return (from tree in Trees
                    where tree.ShouldMerge(treeToMerge)
                    select 1).Count() > 0;
        }

        public virtual Tree Merge(Tree treeToMerge)
        {
            return (from tree in Trees
                    where tree.ShouldMerge(treeToMerge)
                    select tree).First().Merge(treeToMerge);
        }

        public static Subsite Create(Imports.Subsite importedSubsite)
        {
            importedSubsite.Site.Trip.AssertIsImported();
            return new Subsite
            {
                Trees = (from importedTree in importedSubsite.Trees select Tree.Create(importedTree)).ToList(),
                Visits = new List<SubsiteVisit> { SubsiteVisit.Create(importedSubsite) },
                Name = importedSubsite.Name,
                State = importedSubsite.State,
                County = importedSubsite.County,
                Photos = new List<IPhoto>(),
                Visitors = new List<Name>()
            }.RecalculateProperties();
        }
    }

    public class SubsitePhotoReference : PhotoReferenceBase
    {
        protected SubsitePhotoReference() { }
        protected internal SubsitePhotoReference(Photo photo, Subsite subsite) : base(photo) { this.Subsite = subsite; }
        public virtual Subsite Subsite { get; private set; }
        public override bool IsAuthorizedToView(User user) { return true; }
    }
}
