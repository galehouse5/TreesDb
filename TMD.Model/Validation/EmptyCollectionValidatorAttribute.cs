using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Collections;

namespace TMD.Model.Validation
{
    public class EmptyCollectionValidatorAttribute : ValidatorBaseAttribute
    {
        public EmptyCollectionValidatorAttribute(string validationError)
            : base(validationError)
        { }

        public override bool IsValid(object propertyValue)
        {
            ICollection c = propertyValue as ICollection;
            return c != null && c.Count > 0;
        }
    }
}
