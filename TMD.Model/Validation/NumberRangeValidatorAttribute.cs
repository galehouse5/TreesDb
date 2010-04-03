using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;

namespace TMD.Model.Validation
{
    public class NumberRangeValidatorAttribute : ValidatorBaseAttribute
    {
        public NumberRangeValidatorAttribute(string validationError, double min, double max)
            : base(validationError)
        {
            this.Min = min;
            this.Max = max;
        }

        public double Min { get; private set; }
        public double Max { get; private set; }

        public override bool IsValid(object propertyValue)
        {
            double v = (double)propertyValue;
            return v >= Min && v <= Max;
        }
    }
}
