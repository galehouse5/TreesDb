using NHibernate.Validator.Constraints;
using NHibernate.Validator.Engine;
using System.Collections.Generic;
using System.Diagnostics;
using System.Linq;
using TMD.Model.Extensions;
using TMD.Model.Locations;
using TMD.Model.Photos;
using TMD.Model.Users;
using TMD.Model.Validation;

namespace TMD.Model.Imports
{
    [DebuggerDisplay("{Name}")]
    [ContextMethod(nameof(OptionalValidate), Tags = ValidationTag.Optional)]
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
        [NotEmptyOrWhitesapce(Message = "Subsite name must be specified.", Tags = ValidationTag.Required)]
        [Length(100, Message = "Subsite name must not exceed 100 characters.", Tags = ValidationTag.Required)]
        public virtual string Name
        {
            get { return m_Name; }
            set { m_Name = value.OrEmptyAndTrimToTitleCase(); }
        }

        [Valid]
        public virtual Coordinates Coordinates { get; set; }

        protected internal virtual void OptionalValidate(IConstraintValidatorContext context)
        {
            if (Coordinates.IsSpecified
                && !State.CoordinateBounds.Contains(Coordinates))
            {
                context.AddInvalid($"(Optional) Coordinates appear to fall outside the state's boundaries.  You might want to double check them.", nameof(Coordinates));
            }
        }

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

        [NotNull(Message = "Subsite state must be specified.", Tags = ValidationTag.Required)]
        public virtual State State { get; set; }

        private string m_County;
        [NotEmptyOrWhitesapce(Message = "Subsite county must be specified.", Tags = ValidationTag.Required)]
        [Length(100, Message = "Site county must not exceed 100 characters.", Tags = ValidationTag.Required)]
        public virtual string County
        {
            get { return m_County; }
            set { m_County = value.OrEmptyAndTrimToTitleCase(); }
        }

        private string m_OwnershipType;
        [NotEmptyOrWhitesapce(Message = "Subsite ownership type name must be specified.", Tags = ValidationTag.Required)]
        [Length(100, Message = "Subsite ownership type must not exceed 100 characters.", Tags = ValidationTag.Required)]
        public virtual string OwnershipType
        {
            get { return m_OwnershipType; }
            set { m_OwnershipType = value.OrEmptyAndTrim(); }
        }

        private string m_OwnershipContactInfo;
        [Length(200, Message = "Subsite ownership contact info must not exceed 200 characters.", Tags = ValidationTag.Required)]
        public virtual string OwnershipContactInfo
        {
            get { return m_OwnershipContactInfo; }
            set { m_OwnershipContactInfo = value.OrEmptyAndTrim(); }
        }

        public virtual bool MakeOwnershipContactInfoPublic { get; set; }

        private string m_Comments;
        [Length(1000, Message = "Subsite comments must not exceed 1,000 characters.", Tags =  ValidationTag.Required)]
        public virtual string Comments
        {
            get { return m_Comments; }
            set { m_Comments = value.OrEmptyAndTrim(); }
        }

        [Size2(1, int.MaxValue, Message = "You must add tree measurements to this site/subsite.", Tags = ValidationTag.Required)]
        [Size2(0, 10000, Message = "This site/subsite contains too many tree measurements.", Tags = ValidationTag.Required)]
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

        [Size2(0, 100, Message = "This site/subsite contains too many photos.", Tags = ValidationTag.Required)]
        [Valid] public virtual IList<IPhoto> Photos { get; protected set; }

        public virtual void AddPhoto(Photo photo)
        {
            Photos.Add(new SubsitePhotoReference(photo, this));
        }

        public virtual bool RemovePhoto(Photo photo)
        {
            var reference = (from p in Photos where p.EqualsPhoto(photo) select p).FirstOrDefault();
            if (reference == null) { return false; }
            return Photos.Remove(reference);
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
                Photos = new List<IPhoto>()
            }.RecordCreation() as Subsite;
        }
    }

    public class SubsitePhotoReference : PhotoReferenceBase
    {
        protected SubsitePhotoReference() {}
        protected internal SubsitePhotoReference(Photo photo, Subsite subsite) : base(photo) { this.Subsite = subsite; }
        public virtual Subsite Subsite { get; protected set; }
        public override bool IsAuthorizedToAdd(User user) { return user.IsAuthorizedToEdit(Subsite.Site.Trip); }
        public override bool IsAuthorizedToView(User user) { return user.IsAuthorizedToEdit(Subsite.Site.Trip); }
        public override bool IsAuthorizedToRemove(User user) { return user.IsAuthorizedToEdit(Subsite.Site.Trip); }

        public override IList<Name> Photographers
        {
            get { return Subsite.Site.Trip.Measurers; }
        }
    }
}
