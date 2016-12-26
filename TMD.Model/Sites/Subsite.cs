using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Diagnostics;
using System.Linq;
using TMD.Model.Extensions;
using TMD.Model.Locations;
using TMD.Model.Photos;
using TMD.Model.Trees;
using TMD.Model.Users;

namespace TMD.Model.Sites
{
    [DebuggerDisplay("{Name} ({Id})")]
    public class Subsite : IEntity
    {
        protected Subsite()
        { }

        public virtual int Id { get; protected set; }
        public virtual Site Site { get; protected internal set; }

        [DisplayFormat(DataFormatString = "{0:MM/dd/yyyy}")]
        public virtual DateTime LastVisited { get; protected set; }
        public virtual string Name { get; protected set; }
        public virtual State State { get; protected set; }
        public virtual string County { get; protected set; }
        public virtual string OwnershipType { get; protected set; }
        public virtual Coordinates Coordinates { get; protected set; }
        public virtual Coordinates CalculatedCoordinates { get; protected set; }
        public virtual string OwnershipContactInfo { get; protected set; }
        public virtual bool MakeOwnershipContactInfoPublic { get; protected set; }
        public virtual float? RHI5 { get; protected set; }
        public virtual float? RHI10 { get; protected set; }
        public virtual float? RHI20 { get; protected set; }
        public virtual float? RGI5 { get; protected set; }
        public virtual float? RGI10 { get; protected set; }
        public virtual float? RGI20 { get; protected set; }
        public virtual IList<IPhoto> Photos { get; protected set; }
        public virtual int VisitCount { get; protected set; }
        public virtual SubsiteVisit LastVisit { get { return (from v in Visits orderby v.Visited select v).Last(); } }
        public virtual IList<Name> Visitors { get; protected set; }
        
        public virtual Coordinates CalculateCoordinates() 
        { 
            return (from v in Visits orderby v.Visited where v.Coordinates.IsSpecified select v.Coordinates).LastOrDefault() ?? Coordinates.Null(); 
        }
        
        public virtual Coordinates CalculateCalculatedCoordinates() 
        { 
            return (from v in Visits orderby v.Visited where v.CalculatedCoordinates.IsSpecified select v.CalculatedCoordinates).LastOrDefault() ?? Coordinates.Null(); 
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
            Visitors.RemoveAll().AddRange((from visit in Visits
                                          from visitor in visit.Visitors
                                          select visitor).Distinct());
            VisitCount = Visits.Count;
            return this;
        }

        public virtual IList<SubsiteVisit> Visits { get; protected set; }
        public virtual IList<Tree> Trees { get; protected set; }

        public virtual void AddVisit(SubsiteVisit visit)
        {
            Visits.Add(visit);
            visit.Subsite = this;
        }

        public virtual bool RemoveVisit(SubsiteVisit visit)
        {
            if (Visits.Remove(visit))
            {
                visit.Subsite = null;
                return true;
            }
            return false;
        }

        public virtual void AddTree(Tree tree)
        {
            Trees.Add(tree);
            tree.Subsite = this;
        }

        public virtual bool RemoveTree(Tree tree)
        {
            if (Trees.Remove(tree))
            {
                tree.Subsite = null;
                return true;
            }
            return false;
        }

        public const float CoordinateMinutesEquivalenceProximity = 5f;
        public virtual bool ShouldMerge(Subsite subsiteToMerge)
        {
            if (!Name.Equals(subsiteToMerge.Name, StringComparison.OrdinalIgnoreCase))
                return false;

            if (!State.Equals(subsiteToMerge.State) || !County.Equals(subsiteToMerge.County, StringComparison.OrdinalIgnoreCase))
                return false;
            
            if (CalculatedCoordinates.CalculateDistanceInMinutesTo(subsiteToMerge.CalculatedCoordinates) > CoordinateMinutesEquivalenceProximity)
                return false;
            
            return true;
        }

        public virtual Subsite Merge(Subsite otherSubsite)
        {
            foreach (var visit in otherSubsite.Visits)
            {
                AddVisit(visit);
            }

            foreach (Tree tree in otherSubsite.Trees)
            {
                if (ShouldMerge(tree))
                {
                    Merge(tree);
                }
                else
                {
                    AddTree(tree);
                }
            }

            return RecalculateProperties();
        }

        public virtual bool ShouldMerge(Tree otherTree)
        {
            return Trees.Any(t => t.ShouldMerge(otherTree));
        }

        public virtual Tree Merge(Tree otherTree)
        {
            Tree tree = Trees.First(t => t.ShouldMerge(otherTree));
            return tree.Merge(otherTree);
        }

        public static Subsite Create(Imports.Subsite importedSubsite)
        {
            importedSubsite.Site.Trip.AssertIsImported();
            var subsite = new Subsite
            {
                Trees = new List<Tree>(),
                Visits = new List<SubsiteVisit>(),
                Name = importedSubsite.Name,
                State = importedSubsite.State,
                County = importedSubsite.County,
                Photos = new List<IPhoto>(),
                Visitors = new List<Name>()
            };
            subsite.AddVisit(SubsiteVisit.Create(importedSubsite));
            foreach (var tree in importedSubsite.Trees.Select(importedTree => Tree.Create(importedTree)))
            {
                subsite.AddTree(tree);
            }
            return subsite.RecalculateProperties();
        }
    }

    public class SubsitePhotoReference : PhotoReferenceBase
    {
        protected SubsitePhotoReference() { }
        protected internal SubsitePhotoReference(Photo photo, Subsite subsite) : base(photo) { this.Subsite = subsite; }
        public virtual Subsite Subsite { get; protected set; }
        public override bool IsAuthorizedToView(User user) { return true; }

        public override IList<Name> Photographers
        {
            get { return Subsite.Visitors; }
        }
    }
}
