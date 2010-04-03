using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;

namespace TMD.Model.Validation
{
    [AttributeUsage(AttributeTargets.Property, AllowMultiple = true, Inherited = true)]
    public abstract class ValidatorBaseAttribute : Attribute
    {
        protected ValidatorBaseAttribute(string validationError)
        {
            this.ValidationError = validationError;
        }

        public string ValidationError { get; private set; }
        public abstract bool IsValid(object propertyValue);
    }
}
