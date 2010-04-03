using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;

namespace TMD.Model.Validation
{
    public class DateTimeRangeValidatorAttribute : ValidatorBaseAttribute
    {
        public DateTimeRangeValidatorAttribute(string validationError, DateTime min, DateTime max)
            : base(validationError)
        {
            this.Min = min;
            this.Max = max;
        }

        public DateTimeRangeValidatorAttribute(string validationError, string min, string max)
            : base(validationError)
        {
            this.Min = DateTime.Parse(min);
            this.Max = DateTime.Parse(max);
        }

        public DateTime Min { get; private set; }
        public DateTime Max { get; private set; }

        public override bool IsValid(object propertyValue)
        {
            if (propertyValue is DateTime)
            {
                DateTime dt = (DateTime)propertyValue;
                return dt >= Min && dt <= Max;
            }
            return false;
        }
    }
}
