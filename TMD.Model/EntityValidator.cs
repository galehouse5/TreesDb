using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using Microsoft.Practices.EnterpriseLibrary.Validation;
using Microsoft.Practices.EnterpriseLibrary.Common.Configuration;

namespace TMD.Model
{
    public static class EntityValidator
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

        public static ValidationResults Validate(this IEntity entity, params string[] rulesets)
        {
            Type t = entity.GetType();
            ValidationResults vr = new ValidationResults();
            foreach (string ruleset in rulesets)
            {
                vr.AddAllResults(ValidatorFactory.CreateValidator(t, ruleset).Validate(entity));
            }
            return vr;
        }

        public static ValidationResults Validate(this IEntity entity)
        {
            Type t = entity.GetType();
            return ValidatorFactory.CreateValidator(t).Validate(entity);
        }
    }
}
