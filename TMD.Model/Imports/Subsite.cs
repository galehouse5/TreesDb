﻿using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using TMD.Model.Validation;
using System.Diagnostics;
using TMD.Model.Locations;
using TMD.Model.Extensions;
using NHibernate.Validator.Constraints;
using TMD.Model.Photos;
using System.Drawing;

namespace TMD.Model.Imports
{
    [DebuggerDisplay("{Name}")]
    public class Subsite : UserCreatedEntityBase
    {
        protected Subsite()
        { }

        public virtual Site Site { get; protected set; }

        public virtual void SetTripDefaults()
        {
            Site.Trip.DefaultState = State;
            Site.Trip.DefaultCounty = County;
        }

        private string m_Name;
        [NotEmptyOrWhitesapce(Message = "Subsite name must be specified.", Tags = Tag.Screening)]
        [Length(100, Message = "Subsite name must not exceed 100 characters.", Tags = Tag.Persistence)]
        public virtual string Name
        {
            get { return m_Name; }
            set { m_Name = value.OrEmptyAndTrimToTitleCase(); }
        }

        [Valid, Specified(Message = "You must specify coordinates for this subsite, its containing site, or any contained measurement.", Tags = Tag.Finalization)]
        public virtual Coordinates Coordinates { get; set; }

        public virtual bool CanCalculateCoordinates(bool ignoreContainingSite = false)
        {
            if (Coordinates.IsValidAndSpecified())
            {
                return true;
            }
            if (Trees.Where(tm => tm.CanCalculateCoordinates(true)).Count() > 0)
            {
                return true;
            }
            if (!ignoreContainingSite)
            {
                return Site.CanCalculateCoordinates();
            }
            return false;
        }

        public virtual Coordinates CalculateCoordinates(bool ignoreContainingSite = false)
        {
            if (Coordinates.IsValidAndSpecified())
            {
                return Coordinates;
            }
            var bounds = CoordinateBounds.Create(Trees
                .Where(tm => tm.CanCalculateCoordinates(true)).Select(tm => tm.CalculateCoordinates(true)));
            if (bounds.IsSpecified)
            {
                return bounds.Center;
            }
            if (!ignoreContainingSite && Site.CanCalculateCoordinates())
            {
                return Site.CalculateCoordinates();
            }
            return Coordinates.Null();
        }

        [NotNull(Message = "Subsite state must be specified.", Tags = Tag.Screening)]
        public virtual State State { get; set; }

        private string m_County;
        [NotEmptyOrWhitesapce(Message = "Subsite county must be specified.", Tags = Tag.Screening)]
        [Length(100, Message = "Site county must not exceed 100 characters.", Tags = Tag.Persistence)]
        public virtual string County
        {
            get { return m_County; }
            set { m_County = value.OrEmptyAndTrimToTitleCase(); }
        }

        private string m_OwnershipType;
        [NotEmptyOrWhitesapceAttribute(Message = "Subsite ownership type name must be specified.", Tags = Tag.Screening)]
        [Length(100, Message = "Subsite ownership type must not exceed 100 characters.", Tags = Tag.Persistence)]
        public virtual string OwnershipType
        {
            get { return m_OwnershipType; }
            set { m_OwnershipType = value.OrEmptyAndTrim(); }
        }

        private string m_OwnershipContactInfo;
        [Length(200, Message = "Subsite ownership contact info must not exceed 200 characters.", Tags = Tag.Persistence)]
        public virtual string OwnershipContactInfo
        {
            get { return m_OwnershipContactInfo; }
            set { m_OwnershipContactInfo = value.OrEmptyAndTrim(); }
        }

        public virtual bool MakeOwnershipContactInfoPublic { get; set; }

        private string m_Comments;
        [Length(300, Message = "Subsite comments must not exceed 300 characters.", Tags =  Tag.Persistence)]
        public virtual string Comments
        {
            get { return m_Comments; }
            set { m_Comments = value.OrEmptyAndTrim(); }
        }

        [Valid]
        [Size2(1, int.MaxValue, Message = "You must add tree measurements to this subsite.", Tags = Tag.Screening)]
        [Size2(0, 10000, Message = "This subsite contains too many tree measurements.", Tags = Tag.Screening)]
        public virtual IList<TreeBase> Trees { get; protected set; }

        public virtual SingleTrunkTree AddSingleTrunkTree()
        {
            var tree = SingleTrunkTree.Create(this);
            Trees.Add(tree);
            return tree;
        }

        public virtual MultiTrunkTree AddMultiTrunkTree()
        {
            var tree = MultiTrunkTree.Create(this);
            Trees.Add(tree);
            return tree;
        }

        public virtual bool RemoveTree(TreeBase tm)
        {
            return Trees.Remove(tm);
        }

        public virtual TreeBase FindTreeById(int id)
        {
            return Trees.FirstOrDefault(tm => id.Equals(tm.Id));
        }

        [Size2(0, 100, Message = "This subsite contains too many photos.", Tags = Tag.Screening)]
        [Valid] public virtual IList<Photo> Photos { get; protected set; }

        public virtual void AddPhoto(Photo photo)
        {
            photo.Link = ImportPhotoLink.Create(Site.Trip);
            Photos.Add(photo);
        }

        public virtual bool RemovePhoto(Photo photo)
        {
            return Photos.Remove(photo);
        }

        internal static Subsite Create(Site sv)
        {
            return new Subsite
            {
                Name = string.Empty,
                Coordinates = Coordinates.Null(),
                OwnershipType = string.Empty,
                OwnershipContactInfo = string.Empty,
                Comments = string.Empty,
                Trees = new List<TreeBase>(),
                State = sv.Trip.DefaultState,
                County = sv.Trip.DefaultCounty,
                Site = sv,
                MakeOwnershipContactInfoPublic = true,
                Photos = new List<Photo>()
            }.RecordCreation() as Subsite;
        }
    }
}
