using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using TMD.Model.Validation;
using System.Diagnostics;
using TMD.Model.Locations;
using TMD.Model.Extensions;
using NHibernate.Validator.Constraints;

namespace TMD.Model.Trips
{
    [Serializable]
    [DebuggerDisplay("{Name}")]
    public class SubsiteVisit : UserCreatedEntityBase
    {
        protected SubsiteVisit()
        { }

        public virtual SiteVisit SiteVisit { get; private set; }

        public virtual void SetTripDefaults()
        {
            SiteVisit.Trip.SetPrivatePropertyValue("DefaultCountry", Country);
            SiteVisit.Trip.SetPrivatePropertyValue("DefaultState", State);
            SiteVisit.Trip.SetPrivatePropertyValue("DefaultCounty", County);
        }

        private string m_Name;
        [NotEmptyOrWhitesapce(Message = "Subsite name must be specified.", Tags = Tag.Screening)]
        [Length(100, Message = "Subsite name must not exceed 100 characters.", Tags = Tag.Persistence)]
        public virtual string Name
        {
            get { return m_Name; }
            set { m_Name = value.OrEmptyAndTrimToTitleCase(); }
        }

        private Coordinates m_Coordinates;
        [Valid, Specified(Message = "You must specify coordinates for this subsite, its containing site, or any contained measurement.", Tags = Tag.Finalization)]
        public virtual Coordinates Coordinates
        {
            get
            {
                if (CoordinatesCalculated)
                {
                    if (TreeMeasurementCentralCoordinates.IsSpecified)
                    {
                        m_Coordinates = TreeMeasurementCentralCoordinates;
                    }
                    else if (SiteVisit.CoordinatesEntered && SiteVisit.Coordinates.IsValidAndSpecified())
                    {
                        m_Coordinates = SiteVisit.Coordinates;
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

        public virtual bool CoordinatesCalculatedFromContainedTreeMeasurements
        {
            get 
            { 
                return CoordinatesCalculated 
                    && TreeMeasurementCentralCoordinates.IsSpecified; 
            }
        }

        public virtual bool CoordinatesCalculatedFromContainingSiteVisit
        {
            get 
            {
                return CoordinatesCalculated
                    && !TreeMeasurementCentralCoordinates.IsSpecified
                    && SiteVisit.CoordinatesEntered && SiteVisit.Coordinates.IsValidAndSpecified();
            }
        }

        public virtual Coordinates TreeMeasurementCentralCoordinates
        {
            get
            {
                CoordinateBounds cb = CoordinateBounds.Null();
                foreach (TreeMeasurementBase tm in TreeMeasurements)
                {
                    if (tm.CoordinatesEntered && tm.Coordinates.IsValidAndSpecified())
                    {
                        cb.Extend(tm.Coordinates);
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

        [NotNull(Message = "Subsite country must be specified.", Tags = Tag.Screening)]
        public virtual Country Country { get; set; }

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

        public virtual bool KeepOwnershipContactInfoPrivate
        {
            get { return !MakeOwnershipContactInfoPublic; }
            set { MakeOwnershipContactInfoPublic = !value; }
        }

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
        public virtual IList<TreeMeasurementBase> TreeMeasurements { get; private set; }

        public virtual SingleTrunkTreeMeasurement AddSingleTrunkTreeMeasurement()
        {
            SingleTrunkTreeMeasurement sttm = SingleTrunkTreeMeasurement.Create(this);
            TreeMeasurements.Add(sttm);
            return sttm;
        }

        public virtual MultiTrunkTreeMeasurement AddMultiTrunkTreeMeasurement()
        {
            MultiTrunkTreeMeasurement mttm = MultiTrunkTreeMeasurement.Create(this);
            TreeMeasurements.Add(mttm);
            return mttm;
        }

        public virtual bool RemoveTreeMeasurement(TreeMeasurementBase tm)
        {
            return TreeMeasurements.Remove(tm);
        }

        public virtual bool HasTreeMeasurements
        {
            get { return TreeMeasurements.Count > 0; }
        }

        internal static SubsiteVisit Create(SiteVisit sv)
        {
            return new SubsiteVisit
            {
                Name = string.Empty,
                CoordinatesEntered = sv.CoordinatesEntered && sv.Coordinates.IsValidAndSpecified(),
                Coordinates = sv.CoordinatesEntered && sv.Coordinates.IsValidAndSpecified() ? sv.Coordinates : Coordinates.Null(),
                OwnershipType = string.Empty,
                OwnershipContactInfo = string.Empty,
                Comments = string.Empty,
                TreeMeasurements = new List<TreeMeasurementBase>(),
                Country = sv.Trip.DefaultCountry,
                State = sv.Trip.DefaultState,
                County = sv.Trip.DefaultCounty,
                SiteVisit = sv,
                MakeOwnershipContactInfoPublic = true
            }.RecordCreation() as SubsiteVisit;
        }
    }
}
