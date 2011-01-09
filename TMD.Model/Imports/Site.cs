using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using TMD.Model.Validation;
using TMD.Model.Extensions;
using System.Diagnostics;
using System.ComponentModel;
using TMD.Model.Users;
using NHibernate.Validator.Constraints;

namespace TMD.Model.Imports
{
    [DebuggerDisplay("{Name}")]
    public class Site : UserCreatedEntityBase
    {
        protected Site()
        { }

        public virtual Trip Trip { get; private set; }

        private string m_Name;
        [NotEmptyOrWhitesapce(Message = "Site name must be specified.", Tags = Tag.Screening)]
        [Length(100, Message = "Site name must not exceed 100 characters.", Tags = Tag.Persistence)]
        public virtual string Name
        {
            get { return m_Name; }
            set { m_Name = value.OrEmptyAndTrimToTitleCase(); }
        }

        [Valid, Specified(Message = "You must specify coordinates for this site or any contained subsite.", Tags = Tag.Finalization)]
        public virtual Coordinates Coordinates { get; set; }

        public virtual bool CanCalculateCoordinates(bool ignoreContainingTrip = false)
        {
            if (Coordinates.IsValidAndSpecified())
            {
                return true;
            }
            if (Subsites.Where(ss => ss.CanCalculateCoordinates(true)).Count() > 0)
            {
                return true;
            }
            if (!ignoreContainingTrip)
            {
                return Trip.CanCalculateCoordinates();
            }
            return false;
        }

        public virtual Coordinates CalculateCoordinates(bool ignoreContainingTrip = false)
        {
            if (Coordinates.IsValidAndSpecified())
            {
                return Coordinates;
            }
            var bounds = CoordinateBounds.Create(Subsites
                .Where(ss => ss.CanCalculateCoordinates(true)).Select(ss => ss.CalculateCoordinates(true)));
            if (bounds.IsSpecified)
            {
                return bounds.Center;
            }
            if (!ignoreContainingTrip && Trip.CanCalculateCoordinates())
            {
                return Trip.CalculateCoordinates();
            }
            return Coordinates.Null();
        }

        private string m_Comments;
        [Length(300, Message = "Site comments must not exceed 300 characters.", Tags = Tag.Persistence)]
        public virtual string Comments
        {
            get { return m_Comments; }
            set { m_Comments = value.OrEmptyAndTrim(); }
        }

        [Valid]
        [Size2(1, int.MaxValue, Message = "Site must contain at least one subsite.", Tags = Tag.Screening)]
        [Size2(int.MinValue, 100, Message = "Site contains too many subsites.", Tags = new [] { Tag.Screening, Tag.Persistence })]
        public virtual IList<Subsite> Subsites { get; private set; }

        public virtual Subsite AddSubsite()
        {
            var subsite = Subsite.Create(this);
            Subsites.Add(subsite);
            return subsite;
        }

        public virtual bool RemoveSubsite(Subsite sv)
        {
            return Subsites.Remove(sv);
        }

        public virtual Subsite FindSubsiteById(int id)
        {
            return Subsites.FirstOrDefault(ss => id.Equals(ss.Id));
        }

        public virtual TreeBase FindTreeById(int id)
        {
            var subsite = Subsites.FirstOrDefault(ss => ss.FindTreeById(id) != null);
            return subsite == null ? null : subsite.FindTreeById(id);
        }

        internal static Site Create(Trip t)
        {
            return new Site
            {
                Name = string.Empty,
                Coordinates = Coordinates.Null(),
                Subsites = new List<Subsite>(),
                Comments = string.Empty,
                Trip = t
            }.RecordCreation() as Site;
        }
    }
}
