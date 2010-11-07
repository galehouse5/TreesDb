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
    /// Calls a method by name, passing a single parameter of type IConstraintValidatorContext for validation.
    /// </summary>
    [Serializable]
    [AttributeUsage(AttributeTargets.Class, AllowMultiple = true)]
    public class ContextMethodAttribute : EmbeddedRuleArgsAttribute, IValidatorInstanceProvider, IRuleArgs, IValidator
    {
        public ContextMethodAttribute(string methodName)
        {
            this.MethodName = methodName;
        }

        public string MethodName { get; private set; }

        public IValidator Validator
        {
            get { return this; }
        }

        public string Message
        {
            get { return string.Empty; }
            set { }
        }

        public bool IsValid(object value, IConstraintValidatorContext constraintValidatorContext)
        {
            MethodInfo mi = value.GetType().GetMethod(MethodName);
            constraintValidatorContext.DisableDefaultError();
            mi.Invoke(value, new object[] { constraintValidatorContext });
            return false;
        }
    }
}
