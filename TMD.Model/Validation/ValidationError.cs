using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;

namespace TMD.Model.Validation
{
    public class ValidationError
    {
        private ValidationError(object instance, string property, string error)
        {
            this.Instance = instance;
            this.Property = property;
            this.Error = error;
        }

        public object Instance { get; private set; }
        public string Property { get; private set; }
        public string Error { get; private set; }

        internal static ValidationError Create(object instance, string property, string error)
        {
            return new ValidationError(instance, property, error);
        }

        public override string ToString()
        {
            return Error;
        }

        public static implicit operator string(ValidationError ve)
        {
            return ve.ToString();
        }
    }
}
