using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using Microsoft.Practices.EnterpriseLibrary.Validation.Validators;
using Microsoft.Practices.EnterpriseLibrary.Validation;

namespace TMD.Model.Validation
{
    public class SpecifiedValidatorAttribute : ValueValidatorAttribute
    {
        public SpecifiedValidatorAttribute()
        { }

        protected override Validator DoCreateValidator(Type targetType)
        {
            return new SpecifiedValidator(base.Negated);
        }
    }

    public class SpecifiedValidator : ValueValidator<IIsSpecified>
    {
        public SpecifiedValidator()
            : this(false)
        { }

        public SpecifiedValidator(bool negated)
            : this(negated, null)
        { }

        public SpecifiedValidator(string messageTemplate)
            : this(false, messageTemplate)
        { }

        public SpecifiedValidator(bool negated, string messageTemplate)
            : base(messageTemplate, null, negated)
        { }

        protected override void DoValidate(IIsSpecified objectToValidate, object currentTarget, string key, ValidationResults validationResults)
        {
            if (!objectToValidate.IsSpecified && !base.Negated)
            {
                base.LogValidationResult(validationResults, this.GetMessage(objectToValidate, key), currentTarget, key);
            }
        }

        protected override string DefaultNegatedMessageTemplate
        {
            get { return "The value cannot be specified."; }
        }

        protected override string DefaultNonNegatedMessageTemplate
        {
            get { return "The value must be specified."; }
        }
    }
}
