using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;

namespace TMD.Model.Validation
{
    public class ZeroValidatorAttribute : ValidatorBaseAttribute
    {
        public ZeroValidatorAttribute(string validationError)
            : base(validationError)
        { }

        public override bool IsValid(object propertyValue)
        {
            double v = (double)propertyValue;
            return v != 0d;
        }
    }
}
