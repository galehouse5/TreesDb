using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;

namespace TMD.Model.Validation
{
    public class EmptyStringValidatorAttribute : ValidatorBaseAttribute
    {
        public EmptyStringValidatorAttribute(string validationError)
            : base(validationError)
        { }

        public override bool IsValid(object propertyValue)
        {
            return !string.IsNullOrWhiteSpace((string)propertyValue);
        }
    }
}
