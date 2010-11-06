using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using Microsoft.Practices.EnterpriseLibrary.Validation;
using Microsoft.Practices.EnterpriseLibrary.Common.Configuration;

namespace TMD.Model
{
    public static class ModelValidator
    {
        private static ValidatorFactory s_ValidatorFactory;
        public static ValidatorFactory ValidatorFactory
        {
            get
            {
                if (s_ValidatorFactory == null)
                {
                    s_ValidatorFactory = EnterpriseLibraryContainer.Current.GetInstance<AttributeValidatorFactory>();
                }
                return s_ValidatorFactory;
            }
        }

        public static ValidationResults Validate(this object obj, params string[] rulesets)
        {
            Type t = obj.GetType();
            ValidationResults vr = new ValidationResults();
            foreach (string ruleset in rulesets)
            {
                vr.AddAllResults(ValidatorFactory.CreateValidator(t, ruleset).Validate(obj));
            }
            return vr;
        }

        public static ValidationResults Validate(this object obj)
        {
            Type t = obj.GetType();
            return ValidatorFactory.CreateValidator(t).Validate(obj);
        }

        public static ValidationResults ValidateRegardingScreeningAndPersistence(this object obj)
        {
            return obj.Validate("Screening", "Persistence");
        }
    }
}
