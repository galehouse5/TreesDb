using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;

namespace TMD.Model.Validation
{
    public class StringMaxLengthValidator : ValidatorBaseAttribute
    {
        public StringMaxLengthValidator(string validationError, int maxLength)
            : base(validationError)
        {
            this.MaxLength = maxLength;
        }

        public int MaxLength { get; private set; }

        public override bool IsValid(object propertyValue)
        {
            return propertyValue == null 
                || ((string)propertyValue).Length <= MaxLength;
        }
    }
}
