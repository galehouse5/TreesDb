using NHibernate.Validator.Constraints;
using NHibernate.Validator.Engine;
using System.Collections.Generic;
using System.Diagnostics;
using System.Linq;
using TMD.Model.Extensions;
using TMD.Model.Locations;
using TMD.Model.Photos;
using TMD.Model.Validation;

namespace TMD.Model.Imports
{
    [DebuggerDisplay("{Name}")]
    [ContextMethod(nameof(OptionalValidate), Tags = ValidationTag.Optional)]
    public class Site : UserCreatedEntityBase
    {
        protected Site()
        { }

        public virtual Trip Trip { get; protected set; }

        public virtual void SetTripDefaults()
        {
            Trip.DefaultState = State;
            Trip.DefaultCounty = County;
        }

        private string m_Name;
        [NotEmptyOrWhitesapce(Message = "Site name must be specified.", Tags = ValidationTag.Required)]
        [Length(100, Message = "Site name must not exceed 100 characters.", Tags = ValidationTag.Required)]
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

        public virtual bool CanCalculateCoordinates(bool ignoreContainingTrip = false)
        {
            if (Coordinates.IsValidAndSpecified()) return true;
            if (Trees.Where(t => t.CanCalculateCoordinates(true)).Count() > 0) return true;
            if (!ignoreContainingTrip) return Trip.CanCalculateCoordinates();
            return false;
        }

        public virtual Coordinates CalculateCoordinates(bool ignoreContainingTrip = false)
        {
            if (Coordinates.IsValidAndSpecified()) return Coordinates;

            var bounds = CoordinateBounds.Create(Trees
                .Where(tm => tm.CanCalculateCoordinates(true)).Select(tm => tm.CalculateCoordinates(true)));
            if (bounds.IsSpecified) return bounds.Center;

            if (!ignoreContainingTrip && Trip.CanCalculateCoordinates())
                return Trip.CalculateCoordinates();

            return Coordinates.Null();
        }

        [NotNull(Message = "Site state must be specified.", Tags = ValidationTag.Required)]
        public virtual State State { get; set; }

        private string m_County;
        [NotEmptyOrWhitesapce(Message = "Site county must be specified.", Tags = ValidationTag.Required)]
        [Length(100, Message = "Site county must not exceed 100 characters.", Tags = ValidationTag.Required)]
        public virtual string County
        {
            get { return m_County; }
            set { m_County = value.OrEmptyAndTrimToTitleCase(); }
        }

        private string m_OwnershipType;
        [NotEmptyOrWhitesapce(Message = "Site ownership type name must be specified.", Tags = ValidationTag.Required)]
        [Length(100, Message = "Site ownership type must not exceed 100 characters.", Tags = ValidationTag.Required)]
        public virtual string OwnershipType
        {
            get { return m_OwnershipType; }
            set { m_OwnershipType = value.OrEmptyAndTrim(); }
        }

        private string m_OwnershipContactInfo;
        [Length(200, Message = "Site ownership contact info must not exceed 200 characters.", Tags = ValidationTag.Required)]
        public virtual string OwnershipContactInfo
        {
            get { return m_OwnershipContactInfo; }
            set { m_OwnershipContactInfo = value.OrEmptyAndTrim(); }
        }

        public virtual bool MakeOwnershipContactInfoPublic { get; set; }

        private string m_Comments;
        [Length(1000, Message = "Site comments must not exceed 1,000 characters.", Tags = ValidationTag.Required)]
        public virtual string Comments
        {
            get { return m_Comments; }
            set { m_Comments = value.OrEmptyAndTrim(); }
        }

        [Size2(1, int.MaxValue, Message = "You must add tree measurements to this site.", Tags = ValidationTag.Required)]
        [Size2(0, 10000, Message = "This site contains too many tree measurements.", Tags = ValidationTag.Required)]
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
            => Trees.Remove(tm);

        public virtual TreeBase FindTreeById(int id)
            => Trees.FirstOrDefault(tm => id.Equals(tm.Id));

        [Size2(0, 100, Message = "This site contains too many photos.", Tags = ValidationTag.Required)]
        [Valid] public virtual IList<IPhoto> Photos { get; protected set; }

        public virtual void AddPhoto(Photo photo)
        {
            Photos.Add(new SitePhotoReference(photo, this));
        }

        public virtual bool RemovePhoto(Photo photo)
        {
            var reference = (from p in Photos where p.EqualsPhoto(photo) select p).FirstOrDefault();
            if (reference == null) return false;

            return Photos.Remove(reference);
        }

        internal static Site Create(Trip trip)
            => new Site
            {
                Name = string.Empty,
                Coordinates = Coordinates.Null(),
                State = trip.DefaultState,
                County = trip.DefaultCounty,
                OwnershipType = string.Empty,
                OwnershipContactInfo = string.Empty,
                MakeOwnershipContactInfoPublic = true,
                Comments = string.Empty,
                Trees = new List<TreeBase>(),
                Photos = new List<IPhoto>(),
                Trip = trip
            }.RecordCreation() as Site;
    }
}
