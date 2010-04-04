using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;

namespace TMD.Model.Validation
{
    [Serializable]
    public class IsNullValidatorAttribute : ValidatorBaseAttribute
    {
        public IsNullValidatorAttribute(string validationError)
            : base(validationError)
        { }

        public override bool IsValid(object propertyValue)
        {
            IIsNull pv = propertyValue as IIsNull;
            return pv != null && !pv.IsNull;
        }
    }
}
