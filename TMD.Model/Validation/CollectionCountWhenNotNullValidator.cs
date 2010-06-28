using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using Microsoft.Practices.EnterpriseLibrary.Validation.Validators;
using Microsoft.Practices.EnterpriseLibrary.Validation;
using System.Globalization;
using System.Reflection;

namespace TMD.Model.Validation
{
    public class CollectionCountWhenNotNullValidatorAttribute : ValueValidatorAttribute
    {
        public CollectionCountWhenNotNullValidatorAttribute(int upperBound)
            : this(0, RangeBoundaryType.Ignore, upperBound, RangeBoundaryType.Inclusive)
        { }

        public CollectionCountWhenNotNullValidatorAttribute(int lowerBound, int upperBound)
            : this(lowerBound, RangeBoundaryType.Inclusive, upperBound, RangeBoundaryType.Inclusive)
        { }

        public CollectionCountWhenNotNullValidatorAttribute(int lowerBound, RangeBoundaryType lowerBoundType, int upperBound, RangeBoundaryType upperBoundType)
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
            return new CollectionCountWhenNotNullValidator(LowerBound, LowerBoundType, UpperBound, UpperBoundType, Negated);
        }
    }

    public class CollectionCountWhenNotNullValidator : ValueValidator
    {
        public CollectionCountWhenNotNullValidator(int upperBound)
            : this(0, RangeBoundaryType.Ignore, upperBound, RangeBoundaryType.Inclusive)
        { }

        public CollectionCountWhenNotNullValidator(int upperBound, bool negated)
            : this(0, RangeBoundaryType.Ignore, upperBound, RangeBoundaryType.Inclusive, negated)
        { }

        public CollectionCountWhenNotNullValidator(int lowerBound, int upperBound)
            : this(lowerBound, RangeBoundaryType.Inclusive, upperBound, RangeBoundaryType.Inclusive)
        { }

        public CollectionCountWhenNotNullValidator(int lowerBound, int upperBound, bool negated)
          : this(lowerBound, RangeBoundaryType.Inclusive, upperBound, RangeBoundaryType.Inclusive, negated)
        { }

        public CollectionCountWhenNotNullValidator(int lowerBound, RangeBoundaryType lowerBoundType, int upperBound, RangeBoundaryType upperBoundType)
            : this(lowerBound, lowerBoundType, upperBound, upperBoundType, false)
        { }

        public CollectionCountWhenNotNullValidator(int lowerBound, RangeBoundaryType lowerBoundType, int upperBound, RangeBoundaryType upperBoundType, bool negated)
            : this(lowerBound, lowerBoundType, upperBound, upperBoundType, null, negated)
        { }

        public CollectionCountWhenNotNullValidator(int lowerBound, RangeBoundaryType lowerBoundType, int upperBound, RangeBoundaryType upperBoundType, string messageTemplate)
            : this(lowerBound, lowerBoundType, upperBound, upperBoundType, messageTemplate, false)
        { }

        public CollectionCountWhenNotNullValidator(int lowerBound, RangeBoundaryType lowerBoundType, int upperBound, RangeBoundaryType upperBoundType, string messageTemplate, bool negated)
            : base(messageTemplate, null, negated)
        {
            this.RangeChecker = new RangeChecker<int>(lowerBound, lowerBoundType, upperBound, upperBoundType);
        }

        private RangeChecker<int> RangeChecker { get; set; }

        public override void DoValidate(object objectToValidate, object currentTarget, string key, ValidationResults validationResults)
        {
            if (objectToValidate != null)
            {
                Type t = objectToValidate.GetType();
                PropertyInfo pi = t.GetProperty("Count");
                int count = (int)pi.GetValue(objectToValidate, null);
                if (!this.RangeChecker.IsInRange(count) == !base.Negated)
                {
                    base.LogValidationResult(validationResults, this.GetMessage(objectToValidate, key), currentTarget, key);
                }
            }
        }

        protected override string GetMessage(object objectToValidate, string key)
        {
            return string.Format(CultureInfo.CurrentCulture, base.MessageTemplate,
                new object[] { objectToValidate, key, base.Tag, this.RangeChecker.LowerBound, this.RangeChecker.LowerBoundType, this.RangeChecker.UpperBound, this.RangeChecker.UpperBoundType });
        }

        protected override string DefaultNegatedMessageTemplate
        {
            get { return null; }
        }

        protected override string DefaultNonNegatedMessageTemplate
        {
            get { return null; }
        }
    }
}
