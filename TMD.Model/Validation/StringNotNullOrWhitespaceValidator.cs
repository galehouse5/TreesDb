using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using Microsoft.Practices.EnterpriseLibrary.Validation.Validators;
using Microsoft.Practices.EnterpriseLibrary.Validation;

namespace TMD.Model.Validation
{
    public class StringNotNullOrWhitespaceValidatorAttribute : ValueValidatorAttribute
    {
        public StringNotNullOrWhitespaceValidatorAttribute()
        { }

        protected override Validator DoCreateValidator(Type targetType)
        {
            return new StringNotNullOrWhitespaceValidator(base.Negated);
        }
    }

    public class StringNotNullOrWhitespaceValidator : ValueValidator<string>
    {
        public StringNotNullOrWhitespaceValidator()
            : this(false)
        { }

        public StringNotNullOrWhitespaceValidator(bool negated)
            : this(negated, null)
        { }

        public StringNotNullOrWhitespaceValidator(string messageTemplate)
            : this(false, messageTemplate)
        { }

        public StringNotNullOrWhitespaceValidator(bool negated, string messageTemplate)
            : base(messageTemplate, null, negated)
        { }

        protected override void DoValidate(string objectToValidate, object currentTarget, string key, ValidationResults validationResults)
        {
            if (string.IsNullOrWhiteSpace((string)objectToValidate) && !base.Negated)
            {
                base.LogValidationResult(validationResults, this.GetMessage(objectToValidate, key), currentTarget, key);
            }
        }

        protected override string DefaultNegatedMessageTemplate
        {
            get { return "The value must be null or whitespace."; }
        }

        protected override string DefaultNonNegatedMessageTemplate
        {
            get { return "The value cannot be null or whitespace."; }
        }
    }
}
