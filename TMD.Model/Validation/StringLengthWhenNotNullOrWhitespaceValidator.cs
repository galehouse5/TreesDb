using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using Microsoft.Practices.EnterpriseLibrary.Validation.Validators;
using Microsoft.Practices.EnterpriseLibrary.Validation;

namespace TMD.Model.Validation
{
    public class StringLengthWhenNotNullOrWhitespaceValidatorAttribute : ValueValidatorAttribute
    {
        public StringLengthWhenNotNullOrWhitespaceValidatorAttribute(int upperBound)
            : this(0, RangeBoundaryType.Ignore, upperBound, RangeBoundaryType.Inclusive)
        { }

        public StringLengthWhenNotNullOrWhitespaceValidatorAttribute(int lowerBound, int upperBound)
            : this(lowerBound, RangeBoundaryType.Inclusive, upperBound, RangeBoundaryType.Inclusive)
        { }

        public StringLengthWhenNotNullOrWhitespaceValidatorAttribute(int lowerBound, RangeBoundaryType lowerBoundType, int upperBound, RangeBoundaryType upperBoundType)
        {
            this.LowerBound = lowerBound;
            this.LowerBoundType = lowerBoundType;
            this.UpperBound = upperBound;
            this.UpperBoundType = upperBoundType;
        }

        private int LowerBound { get; set; }
        private RangeBoundaryType LowerBoundType { get; set; }
        private int UpperBound { get; set; }
        private RangeBoundaryType UpperBoundType { get; set; }

        protected override Validator DoCreateValidator(Type targetType)
        {
            return new StringLengthWhenNotNullOrWhitespaceValidator(LowerBound, LowerBoundType, UpperBound, UpperBoundType, Negated);
        }
    }

    public class StringLengthWhenNotNullOrWhitespaceValidator : StringLengthValidator
    {
        public StringLengthWhenNotNullOrWhitespaceValidator(int upperBound)
            : base(upperBound)
        { }

        public StringLengthWhenNotNullOrWhitespaceValidator(int upperBound, bool negated)
            : base(upperBound, negated)
        { }

        public StringLengthWhenNotNullOrWhitespaceValidator(int lowerBound, int upperBound)
            : base(lowerBound, upperBound)
        { }

        public StringLengthWhenNotNullOrWhitespaceValidator(int lowerBound, int upperBound, bool negated)
            : base(lowerBound, upperBound, negated)
        { }

        public StringLengthWhenNotNullOrWhitespaceValidator(int lowerBound, RangeBoundaryType lowerBoundType, int upperBound, RangeBoundaryType upperBoundType)
            : base(lowerBound, lowerBoundType, upperBound, upperBoundType)
        { }

        public StringLengthWhenNotNullOrWhitespaceValidator(int lowerBound, RangeBoundaryType lowerBoundType, int upperBound, RangeBoundaryType upperBoundType, bool negated)
            : base(lowerBound, lowerBoundType, upperBound, upperBoundType, negated)
        { }

        public StringLengthWhenNotNullOrWhitespaceValidator(int lowerBound, RangeBoundaryType lowerBoundType, int upperBound, RangeBoundaryType upperBoundType, string messageTemplate)
            : base(lowerBound, lowerBoundType, upperBound, upperBoundType, messageTemplate)
        { }

        public StringLengthWhenNotNullOrWhitespaceValidator(int lowerBound, RangeBoundaryType lowerBoundType, int upperBound, RangeBoundaryType upperBoundType, string messageTemplate, bool negated)
            : base(lowerBound, lowerBoundType, upperBound, upperBoundType, messageTemplate, negated)
        { }

        public override void DoValidate(object objectToValidate, object currentTarget, string key, ValidationResults validationResults)
        {
            if (!string.IsNullOrWhiteSpace((string)objectToValidate))
            {
                base.DoValidate(objectToValidate, currentTarget, key, validationResults);
            }
        }
    }
}
