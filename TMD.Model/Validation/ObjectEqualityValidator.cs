using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using Microsoft.Practices.EnterpriseLibrary.Validation.Validators;
using Microsoft.Practices.EnterpriseLibrary.Validation;

namespace TMD.Model.Validation
{
    public class ObjectEqualityValidatorAttribute : ValueValidatorAttribute
    {
        public ObjectEqualityValidatorAttribute(object obj)
        {
            this.Obj = obj;
        }

        private object Obj { get; set; }

        protected override Validator DoCreateValidator(Type targetType)
        {
            return new ObjectEqualityValidator(Obj);
        }
    }

    public class ObjectEqualityValidator : ValueValidator
    {
        public ObjectEqualityValidator(object obj)
            : this(obj, false)
        { }

        public ObjectEqualityValidator(object obj, bool negated)
            : this(obj, negated, null)
        { }

        public ObjectEqualityValidator(object obj, string messageTemplate)
            : this(obj, false, messageTemplate)
        { }

        public ObjectEqualityValidator(object obj, bool negated, string messageTemplate)
            : base(messageTemplate, null, negated)
        {
            this.Obj = obj;
        }

        public object Obj { get; private set; }

        public override void DoValidate(object objectToValidate, object currentTarget, string key, ValidationResults validationResults)
        {
            if (Obj.Equals(objectToValidate) == !base.Negated)
            {
                base.LogValidationResult(validationResults, this.GetMessage(objectToValidate, key), currentTarget, key);
            }
        }

        protected override string DefaultNegatedMessageTemplate
        {
            get { return "The value cannot be equal."; }
        }

        protected override string DefaultNonNegatedMessageTemplate
        {
            get { return "The value must be equal."; }
        }
    }
}
