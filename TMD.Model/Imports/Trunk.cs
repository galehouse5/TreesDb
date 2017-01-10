using NHibernate.Validator.Constraints;
using NHibernate.Validator.Engine;
using TMD.Model.Extensions;
using TMD.Model.Validation;

namespace TMD.Model.Imports
{
    [ContextMethod(nameof(RequiredValidate), Tags = ValidationTag.Required)]
    public class Trunk : UserCreatedEntityBase
    {
        protected Trunk()
        { }

        public virtual MultiTrunkTree Tree { get; protected set; }

        [Valid] public virtual Distance Girth { get; set; }
        [Valid] public virtual Distance GirthMeasurementHeight { get; set; }
        [Valid] public virtual Distance Height { get; set; }

        public virtual void RequiredValidate(IConstraintValidatorContext context)
        {
            if (!Height.IsSpecified && !Girth.IsSpecified && !HeightMeasurements.IsSpecified)
            {
                context.AddInvalid<Trunk, Distance>("You must specify a height or girth.", tm => tm.Girth);
                context.AddInvalid<Trunk, Distance>("You must specify a height or girth.", tm => tm.Height);
            }
        }

        [Valid] public virtual HeightMeasurements HeightMeasurements { get; set; }

        private string m_TrunkComments;
        [Length(1000, Message = "Trunk comments must not exceed 1,000 characters.", Tags = ValidationTag.Required)]
        public virtual string TrunkComments
        {
            get { return m_TrunkComments; }
            set { m_TrunkComments = value.OrEmptyAndTrim(); }
        }

        public static Trunk Create(MultiTrunkTree mttm)
        {
            return new Trunk()
            {
                Tree = mttm,
                Girth = Distance.Null(),
                GirthMeasurementHeight = Distance.Null(),
                Height = Distance.Null(),
                HeightMeasurements = HeightMeasurements.Null(),
                TrunkComments = string.Empty
            }.RecordCreation() as Trunk;
        }
    }
}
