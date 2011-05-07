using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using NHibernate.Validator.Constraints;
using NHibernate.Validator.Engine;

namespace TMD.Model.Validation
{
    public class NotEqualsAttribute : EmbeddedRuleArgsAttribute, IRuleArgs, IValidator
    {
        public NotEqualsAttribute(object obj)
        {
            this.Obj = obj;
        }

        public object Obj { get; private set; }
        public string Message { get; set; }

        public bool IsValid(object value, IConstraintValidatorContext constraintValidatorContext)
        {
            return !Obj.Equals(value);
        }
    }
}
