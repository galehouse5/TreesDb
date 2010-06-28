using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using Microsoft.Practices.EnterpriseLibrary.Validation.Validators;
using Microsoft.Practices.EnterpriseLibrary.Validation;
using System.Globalization;

namespace TMD.Model.Validation
{
    public class DateTimeRangeWhenNotNullValidatorAttribute : ValueValidatorAttribute
    {
        public DateTimeRangeWhenNotNullValidatorAttribute(DateTime upperBound)
            : this(new DateTime(), RangeBoundaryType.Ignore, upperBound, RangeBoundaryType.Inclusive)
        { }

        public DateTimeRangeWhenNotNullValidatorAttribute(string upperBound)
            : this(DateTime.ParseExact(upperBound, "s", CultureInfo.InvariantCulture))
        { }

        public DateTimeRangeWhenNotNullValidatorAttribute(DateTime lowerBound, DateTime upperBound)
            : this(lowerBound, RangeBoundaryType.Inclusive, upperBound, RangeBoundaryType.Inclusive)
        { }

        public DateTimeRangeWhenNotNullValidatorAttribute(string lowerBound, string upperBound)
            : this(DateTime.ParseExact(lowerBound, "s", CultureInfo.InvariantCulture), RangeBoundaryType.Inclusive, DateTime.ParseExact(upperBound, "s", CultureInfo.InvariantCulture), RangeBoundaryType.Inclusive)
        { }

        public DateTimeRangeWhenNotNullValidatorAttribute(DateTime lowerBound, RangeBoundaryType lowerBoundType, DateTime upperBound, RangeBoundaryType upperBoundType)
        {
            this.LowerBound = lowerBound;
            this.LowerBoundType = lowerBoundType;
            this.UpperBound = upperBound;
            this.UpperBoundType = upperBoundType;
        }

        public DateTimeRangeWhenNotNullValidatorAttribute(string lowerBound, RangeBoundaryType lowerBoundType, string upperBound, RangeBoundaryType upperBoundType)
            : this(DateTime.ParseExact(lowerBound, "s", CultureInfo.InvariantCulture), lowerBoundType, DateTime.ParseExact(upperBound, "s", CultureInfo.InvariantCulture), upperBoundType)
        { }

        private DateTime LowerBound { get; set; }
        private RangeBoundaryType LowerBoundType { get; set; }
        private DateTime UpperBound { get; set; }
        private RangeBoundaryType UpperBoundType { get; set; }

        protected override Validator DoCreateValidator(Type targetType)
        {
            return new DateTimeRangeWhenNotNullValidator(LowerBound, LowerBoundType, UpperBound, UpperBoundType);
        }
    }

    public class DateTimeRangeWhenNotNullValidator : DateTimeRangeValidator
    {
        public DateTimeRangeWhenNotNullValidator(DateTime upperBound)
            : base(upperBound)
        { }

        public DateTimeRangeWhenNotNullValidator(DateTime upperBound, bool negated)
            : base(upperBound, negated)
        { }

        public DateTimeRangeWhenNotNullValidator(DateTime lowerBound, DateTime upperBound)
            : base(lowerBound, upperBound)
        { }

        public DateTimeRangeWhenNotNullValidator(DateTime lowerBound, DateTime upperBound, bool negated)
            : base(lowerBound, upperBound, negated)
        { }

        public DateTimeRangeWhenNotNullValidator(DateTime lowerBound, RangeBoundaryType lowerBoundType, DateTime upperBound, RangeBoundaryType upperBoundType)
            : base(lowerBound, lowerBoundType, upperBound, upperBoundType)
        { }

        public DateTimeRangeWhenNotNullValidator(DateTime lowerBound, RangeBoundaryType lowerBoundType, DateTime upperBound, RangeBoundaryType upperBoundType, bool negated)
            : base(lowerBound, lowerBoundType, upperBound, upperBoundType, negated)
        { }
        
        public DateTimeRangeWhenNotNullValidator(DateTime lowerBound, RangeBoundaryType lowerBoundType, DateTime upperBound, RangeBoundaryType upperBoundType, string messageTemplate)
            : base(lowerBound, lowerBoundType, upperBound, upperBoundType, messageTemplate)
        { }
       
        public DateTimeRangeWhenNotNullValidator(DateTime lowerBound, RangeBoundaryType lowerBoundType, DateTime upperBound, RangeBoundaryType upperBoundType, string messageTemplate, bool negated)
            : base(lowerBound, lowerBoundType, upperBound, upperBoundType, messageTemplate, negated)
        { }
            
        public override void DoValidate(object objectToValidate, object currentTarget, string key, ValidationResults validationResults)
        {
            if (objectToValidate != null)
            {
                base.DoValidate(objectToValidate, currentTarget, key, validationResults);
            }
        }
    }
}
