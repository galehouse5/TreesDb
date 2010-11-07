using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using NHibernate.Validator.Constraints;
using NHibernate.Validator.Engine;

namespace TMD.Model.Validation
{
    public class NotEmptyOrWhitesapceAttribute : EmbeddedRuleArgsAttribute, IRuleArgs, IValidator
    {
        public NotEmptyOrWhitesapceAttribute()
        { }

        public string Message { get; set; }

        public bool IsValid(object value, IConstraintValidatorContext constraintValidatorContext)
        {
            return !string.IsNullOrWhiteSpace((string)value);
        }
    }
}
