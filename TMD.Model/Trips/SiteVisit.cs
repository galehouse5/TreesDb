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

namespace TMD.Model.Trips
{
    [Serializable]
    [DebuggerDisplay("{Name}")]
    public class SiteVisit : UserCreatedEntityBase
    {
        protected SiteVisit()
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

        private Coordinates m_Coordinates;
        [Valid]
        [Specified(Message = "You must specify coordinates for this site or any contained subsite.", Tags = Tag.Finalization)]
        public virtual Coordinates Coordinates
        {
            get
            {
                if (CoordinatesCalculated)
                {
                    if (SubsiteVisitCentralCoordinates.IsSpecified)
                    {
                        m_Coordinates = SubsiteVisitCentralCoordinates;
                    }
                    else
                    {
                        m_Coordinates = Coordinates.Null();
                    }
                }
                return m_Coordinates;
            }
            set
            {
                m_Coordinates = value;
            }
        }

        public virtual bool CoordinatesCalculatedFromContainedSubsiteVisits
        {
            get
            {
                return CoordinatesCalculated
                    && SubsiteVisitCentralCoordinates.IsSpecified;
            }
        }

        public virtual Coordinates SubsiteVisitCentralCoordinates
        {
            get
            {
                CoordinateBounds cb = CoordinateBounds.Null();
                foreach (SubsiteVisit ssv in SubsiteVisits)
                {
                    if (ssv.CoordinatesEntered && ssv.Coordinates.IsValidAndSpecified())
                    {
                        cb.Extend(ssv.Coordinates);
                    }
                }
                return cb.Center;
            }
        }

        public virtual bool CoordinatesCalculated { get; set; }

        public virtual bool CoordinatesEntered
        {
            get { return !CoordinatesCalculated; }
            set { CoordinatesCalculated = !value; }
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
        public virtual IList<SubsiteVisit> SubsiteVisits { get; private set; }

        public virtual SubsiteVisit AddSubsiteVisit()
        {
            SubsiteVisit subsite = SubsiteVisit.Create(this);
            SubsiteVisits.Add(subsite);
            return subsite;
        }

        public virtual SubsiteVisit AddSubsiteVisit(SubsiteVisit ssv)
        {
            ssv.SetPrivatePropertyValue("SiteVisit", this);
            SubsiteVisits.Add(ssv);
            return ssv;
        }

        public virtual bool RemoveSubsiteVisit(SubsiteVisit subsite)
        {
            return SubsiteVisits.Remove(subsite);
        }

        public virtual bool HasSubsiteVisits
        {
            get { return SubsiteVisits.Count > 0; }
        }

        public virtual bool AllSubsiteVisitsHaveTreeMeasurements
        {
            get
            {
                foreach (SubsiteVisit ssv in SubsiteVisits)
                {
                    if (!ssv.HasTreeMeasurements)
                    {
                        return false;
                    }
                }
                return true;
            }
        }

        public virtual SubsiteVisit GetSubsiteVisit(int id)
        {
            foreach (SubsiteVisit ssv in SubsiteVisits)
            {
                if (ssv.Id == id)
                {
                    return ssv;
                }
            }
            return null;
        }

        public virtual bool HasBeenModifiedSinceCreation
        {
            get
            {
                return !Name.Equals(string.Empty)
                    || !CoordinatesCalculated
                    || Coordinates != Coordinates.Null()
                    || SubsiteVisits.Count != 0
                    || !Comments.Equals(string.Empty);
            }
        }

        internal static SiteVisit Create(Trip t)
        {
            return new SiteVisit
            {
                Name = string.Empty,
                CoordinatesEntered = t.SiteVisitCentralCoordinates.IsValidAndSpecified(),
                Coordinates = t.SiteVisitCentralCoordinates.IsValidAndSpecified() ? t.SiteVisitCentralCoordinates : Coordinates.Null(),
                SubsiteVisits = new List<SubsiteVisit>(),
                Comments = string.Empty,
                Trip = t
            }.RecordCreation() as SiteVisit;
        }
    }
}
