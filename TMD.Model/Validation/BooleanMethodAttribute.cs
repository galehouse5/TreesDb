using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using NHibernate.Validator.Constraints;
using NHibernate.Validator.Engine;
using System.Reflection;

namespace TMD.Model.Validation
{
    /// <summary>
    /// Calls a parameterless method by name, expecting a boolean return value for validation.
    /// </summary>
    [Serializable]
    [AttributeUsage(AttributeTargets.Class, AllowMultiple = true)]
    public class BooleanMethodAttribute : EmbeddedRuleArgsAttribute, IValidatorInstanceProvider, IRuleArgs, IValidator
    {
        public BooleanMethodAttribute(string methodName)
        {
            this.MethodName = methodName;
            this.Message = string.Empty;
        }

        public string MethodName { get; private set; }

        public IValidator Validator
        {
            get { return this; }
        }

        public string Message { get; set; }

        public bool IsValid(object value, IConstraintValidatorContext constraintValidatorContext)
        {
            MethodInfo mi = value.GetType().GetMethod(MethodName);
            return (bool)mi.Invoke(value, null);
        }
    }
}
