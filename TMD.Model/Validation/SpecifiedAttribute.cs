using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using NHibernate.Validator.Constraints;
using NHibernate.Validator.Engine;

namespace TMD.Model.Validation
{
    public class SpecifiedAttribute : EmbeddedRuleArgsAttribute, IRuleArgs, IValidator
    {
        public SpecifiedAttribute()
        { }

        public string Message { get; set; }

        public bool IsValid(object value, IConstraintValidatorContext constraintValidatorContext)
        {
            ISpecified obj = value as ISpecified;
            if (obj != null)
            {
                return obj.IsSpecified;
            }
            return false;
        }
    }
}
