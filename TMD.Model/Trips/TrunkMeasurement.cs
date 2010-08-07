using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.ComponentModel;
using TMD.Model.Validation;
using Microsoft.Practices.EnterpriseLibrary.Validation;
using Microsoft.Practices.EnterpriseLibrary.Validation.Validators;

namespace TMD.Model.Trips
{
    [Serializable]
    [HasSelfValidation]
    public class TrunkMeasurement : BaseUserCreatedEntity
    {
        protected TrunkMeasurement()
        { }

        public virtual MultiTrunkTreeMeasurement TreeMeasurement { get; protected set; }

        [DisplayName("Girth:")]
        [ModelObjectValidator(NamespaceQualificationMode.ReplaceKey, "Screening", Ruleset = "Screening", Tag = "TrunkMeasurement")]
        public virtual Distance Girth { get; set; }

        [DisplayName("Girth measurement height:")]
        [ModelObjectValidator(NamespaceQualificationMode.ReplaceKey, "Screening", Ruleset = "Screening", Tag = "TrunkMeasurement")]
        public virtual Distance GirthMeasurementHeight { get; set; }

        [DisplayName("Height:")]
        [ModelObjectValidator(NamespaceQualificationMode.ReplaceKey, "Screening", Ruleset = "Screening", Tag = "TrunkMeasurement")]
        public virtual Distance Height { get; set; }

        [SelfValidation(Ruleset = "Screening")]
        public virtual void CheckHeightOrGirthIsSpecified(ValidationResults results)
        {
            if (!Height.IsSpecified && !Girth.IsSpecified && !HeightMeasurements.IsSpecified)
            {
                results.AddResult(new ValidationResult(
                    "You must enter either a height or a girth.", this, "Girth", "TrunkMeasurement", null));
            }
        }

        [SelfValidation(Ruleset = "Screening")]
        public virtual void CheckHeightDistanceAngeAngleMeasurementsAreIncluded(ValidationResults results)
        {
            if (IncludeHeightDistanceAndAngleMeasurements)
            {
                if (!HeightMeasurements.IsSpecified)
                {
                    results.AddResult(new Microsoft.Practices.EnterpriseLibrary.Validation.ValidationResult(
                        "You must specify enough distance and angle measurements to calculate a height.", this, "HeightMeasurements.Height", "TrunkMeasurement", null));
                }
            }
        }

        [DisplayName("Enter distance and angle measurements")]
        public virtual bool IncludeHeightDistanceAndAngleMeasurements { get; set; }

        [ModelObjectValidator(NamespaceQualificationMode.PrependToKey, "Screening", Ruleset = "Screening", Tag = "TrunkMeasurement")]
        public virtual HeightMeasurements HeightMeasurements { get; set; }

        private string m_TrunkComments;
        [DisplayName("Trunk comments:")]
        [StringLengthWhenNotNullOrWhitespaceValidator(300, MessageTemplate = "Trunk comments must not exceed 300 characters.", Ruleset = "Persistence", Tag = "TrunkMeasurement")]
        public virtual string TrunkComments
        {
            get { return m_TrunkComments; }
            set { m_TrunkComments = (value ?? string.Empty).Trim(); }
        }

        public virtual ValidationResults ValidateRegardingScreeningAndPersistence()
        {
            return this.Validate("Screening", "Persistence");
        }

        public virtual ValidationResults ValidateRegardingPersistence()
        {
            return this.Validate("Persistence");
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
            };
        }
    }
}
