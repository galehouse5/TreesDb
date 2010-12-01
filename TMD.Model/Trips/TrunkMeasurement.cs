﻿using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using TMD.Model.Validation;
using NHibernate.Validator.Constraints;
using NHibernate.Validator.Engine;
using TMD.Model.Extensions;

namespace TMD.Model.Trips
{
    [Serializable]
    [ContextMethod("CheckHeightOrGirthIsSpecified", Tags = Tag.Screening)]
    [ContextMethod("CheckHeightDistanceAngeAngleMeasurementsAreIncluded", Tags = Tag.Screening)]
    public class TrunkMeasurement : UserCreatedEntityBase
    {
        protected TrunkMeasurement()
        { }

        public virtual MultiTrunkTreeMeasurement TreeMeasurement { get; protected set; }

        [Valid]
        public virtual Distance Girth { get; set; }

        [Valid]
        public virtual Distance GirthMeasurementHeight { get; set; }

        [Valid]
        public virtual Distance Height { get; set; }

        public virtual void CheckHeightOrGirthIsSpecified(IConstraintValidatorContext context)
        {
            if (!Height.IsSpecified && !Girth.IsSpecified && !HeightMeasurements.IsSpecified)
            {
                context.AddInvalid<TrunkMeasurement, Distance>("You must enter either a height or a girth.", tm => tm.Girth);
            }
        }

        public virtual void CheckHeightDistanceAngeAngleMeasurementsAreIncluded(IConstraintValidatorContext context)
        {
            if (IncludeHeightDistanceAndAngleMeasurements)
            {
                if (!HeightMeasurements.IsSpecified)
                {
                    context.AddInvalid<TrunkMeasurement, HeightMeasurements>("You must specify enough distance and angle measurements to calculate a height.", tm => tm.HeightMeasurements);
                }
            }
        }

        public virtual bool IncludeHeightDistanceAndAngleMeasurements { get; set; }

        [Valid]
        public virtual HeightMeasurements HeightMeasurements { get; set; }

        private string m_TrunkComments;
        [Length(300, Message = "Trunk comments must not exceed 300 characters.", Tags = Tag.Persistence)]
        public virtual string TrunkComments
        {
            get { return m_TrunkComments; }
            set { m_TrunkComments = value.OrEmptyAndTrim(); }
        }

        public static TrunkMeasurement Create(MultiTrunkTreeMeasurement mttm)
        {
            return new TrunkMeasurement()
            {
                TreeMeasurement = mttm,
                Girth = Distance.Null(),
                GirthMeasurementHeight = Distance.Null(),
                Height = Distance.Null(),
                HeightMeasurements = HeightMeasurements.Null(),
                IncludeHeightDistanceAndAngleMeasurements = false,
                TrunkComments = string.Empty
            }.RecordCreation() as TrunkMeasurement;
        }
    }
}
