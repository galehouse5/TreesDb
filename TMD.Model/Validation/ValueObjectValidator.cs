using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using Microsoft.Practices.EnterpriseLibrary.Validation.Validators;
using Microsoft.Practices.EnterpriseLibrary.Validation;

namespace TMD.Model.Validation
{
    public enum NamespaceQualificationMode
    {
        None,
        PrependToKey,
        ReplaceKey
    }

    public class ValueObjectValidatorAttribute : ValidatorAttribute
    {
        public ValueObjectValidatorAttribute(NamespaceQualificationMode mode)
            : this(mode, string.Empty)
        { }

        public ValueObjectValidatorAttribute(NamespaceQualificationMode mode, string targetRuleset)
        {
            if (targetRuleset == null)
            {
                throw new ArgumentNullException("targetRuleset");
            }
            TargetRuleset = targetRuleset;
            Mode = mode;
        }

        public string TargetRuleset { get; private set; }
        public NamespaceQualificationMode Mode { get; private set; }
        public bool ValidateActualType { get; set; }

        protected override Validator DoCreateValidator(Type targetType)
        {
            throw new NotImplementedException();
        }

        protected override Validator DoCreateValidator(Type targetType, Type ownerType, MemberValueAccessBuilder memberValueAccessBuilder, ValidatorFactory validatorFactory)
        {
            if (this.ValidateActualType)
            {
                return new ValueObjectValidator(Mode, validatorFactory, TargetRuleset);
            }
            return new ValueObjectValidator(Mode, targetType, validatorFactory, TargetRuleset);
        }
    }

    public class ValueObjectValidator : ObjectValidator
    {
        public ValueObjectValidator(NamespaceQualificationMode mode)
            : base()
        {
            Mode = mode;
        }

        public ValueObjectValidator(NamespaceQualificationMode mode, ValidatorFactory validatorFactory)
            : base(validatorFactory)
        {
            Mode = mode;
        }

        public ValueObjectValidator(NamespaceQualificationMode mode, Type targetType)
            : base(targetType)
        {
            Mode = mode;
        }

        public ValueObjectValidator(NamespaceQualificationMode mode, ValidatorFactory validatorFactory, string targetRuleset)
            : base(validatorFactory, targetRuleset)
        {
            Mode = mode;
        }

        public ValueObjectValidator(NamespaceQualificationMode mode, Type targetType, string targetRuleset)
            : base(targetType, targetRuleset)
        {
            Mode = mode;
        }

        public ValueObjectValidator(NamespaceQualificationMode mode, Type targetType, ValidatorFactory validatorFactory, string targetRuleset)
            : base(targetType, validatorFactory, targetRuleset)
        {
            Mode = mode;
        }

        public NamespaceQualificationMode Mode { get; private set; }

        public override void DoValidate(object objectToValidate, object currentTarget, string key, ValidationResults validationResults)
        {
            ValidationResults baseResults = new ValidationResults();
            base.DoValidate(objectToValidate, currentTarget, key, baseResults);
            foreach (ValidationResult baseResult in baseResults)
            {
                baseResult.SetPrivateFieldValue("tag", Tag);
                switch (Mode)
                {
                    case NamespaceQualificationMode.PrependToKey :
                        baseResult.SetPrivateFieldValue("key", string.Format("{0}.{1}", key, baseResult.Key));
                        break;
                    case NamespaceQualificationMode.ReplaceKey :
                        baseResult.SetPrivateFieldValue("key", key);
                        break;
                    default :
                        break;
                }
                validationResults.AddResult(baseResult);
            }
        }
    }
}
