using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;

namespace TMD.Model.Validation
{
    public class IsValidValidatorAttribute : ValidatorBaseAttribute
    {
        public IsValidValidatorAttribute(string validationError)
            : base(validationError)
        { }

        public override bool IsValid(object propertyValue)
        {
            IIsValid iv = propertyValue as IIsValid;
            return iv == null || iv.IsValid;
        }
    }
}
