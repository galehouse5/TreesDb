using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Collections;

namespace TMD.Model.Validation
{
    public class CollectionMaxCountValidatorAttribute : ValidatorBaseAttribute
    {
        public CollectionMaxCountValidatorAttribute(string validationError, int maxCount)
            : base(validationError)
        {
            this.MaxCount = maxCount;
        }

        public int MaxCount { get; private set; }

        public override bool IsValid(object propertyValue)
        {
            ICollection c = propertyValue as ICollection;
            return c != null && c.Count <= MaxCount;
        }
    }
}
