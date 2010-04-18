using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;

namespace TMD.Model.Validation
{
    public class DateRangeValidatorAttribute : ValidatorBaseAttribute
    {
        public DateRangeValidatorAttribute(string validationError, Date min, Date max)
            : base(validationError)
        {
            this.Min = min;
            this.Max = max;
        }

        public DateRangeValidatorAttribute(string validationError, string min, string max)
            : base(validationError)
        {
            this.Min = Date.Create(min);
            this.Max = Date.Create(max);
        }

        public Date Min { get; private set; }
        public Date Max { get; private set; }

        public override bool IsValid(object propertyValue)
        {
            if (propertyValue is Date)
            {
                Date dt = (Date)propertyValue;
                return dt >= Min && dt <= Max;
            }
            return false;
        }
    }
}
