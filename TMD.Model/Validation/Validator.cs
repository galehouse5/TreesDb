using NHibernate.Validator.Engine;
using System;
using System.Collections.Generic;
using System.Linq;

namespace TMD.Model.Validation
{
    public enum ValidationTag
    {
        Required, Optional
    }

    public abstract class ValidatorBase
    {
        public IEnumerable<IValidationError> Validate(object source)
        {
            if (source is IEnumerable<IValidationError>)
            {
                return (IEnumerable<IValidationError>)source;
            }
            return InternalValidate(source);
        }

        protected abstract IEnumerable<IValidationError> InternalValidate(object source);

        public virtual IEnumerable<IValidationError> Validate(object source, params ValidationTag[] tags)
        {
            if (source is IEnumerable<IValidationError>)
            {
                return ((IEnumerable<IValidationError>)source)
                    .Where(iv => tags.Any(t => iv.Tags.Contains(t)));
            }
            object[] normalizedTags = new object[tags.Length];
            tags.CopyTo(normalizedTags, 0);
            return InternalValidate(source, normalizedTags);
        }

        protected abstract IEnumerable<IValidationError> InternalValidate(object source, params object[] tags);
    }

    public class ClassValidator : ValidatorBase
    {
        private IClassValidator m_CV;
        internal ClassValidator(IClassValidator cv)
        {
            m_CV = cv;
        }

        protected override IEnumerable<IValidationError> InternalValidate(object source)
        {
            foreach (var iv in m_CV.GetInvalidValues(source))
            {
                yield return new InvalidValueValidationError(iv);
            }
        }

        protected override IEnumerable<IValidationError> InternalValidate(object source, params object[] tags)
        {
            foreach (var iv in m_CV.GetInvalidValues(source, tags))
            {
                yield return new InvalidValueValidationError(iv);
            }
        }
    }

    public class ValidatorEngineValidator : ValidatorBase
    {
        private ValidatorEngine m_E;
        internal ValidatorEngineValidator(ValidatorEngine e)
        {
            m_E = e;
        }

        protected override IEnumerable<IValidationError> InternalValidate(object source)
        {
            foreach (var iv in m_E.Validate(source))
            {
                yield return new InvalidValueValidationError(iv);
            }
        }

        protected override IEnumerable<IValidationError> InternalValidate(object source, params object[] tags)
        {
            foreach (var iv in m_E.Validate(source, tags))
            {
                yield return new InvalidValueValidationError(iv);
            }
        }
    }


    public static class Validator
    {
        private static ValidatorEngine s_VE = new ValidatorEngine();

        private static ValidatorEngineValidator s_GlobalValidator;
        public static ValidatorBase GlobalValidator
        {
            get
            {
                if (s_GlobalValidator == null)
                {
                    s_GlobalValidator = new ValidatorEngineValidator(s_VE);
                }
                return s_GlobalValidator;
            }
        }

        public static ValidatorBase ClassValidator(this object source)
        {
            if (source is Type)
            {
                return new ClassValidator(s_VE.GetClassValidator((Type)source));
            }
            return new ClassValidator(s_VE.GetClassValidator(source.GetType()));
        }

        public static IEnumerable<IValidationError> Validate(this object source)
        {
            return GlobalValidator.Validate(source);
        }

        public static IEnumerable<IValidationError> Validate(this object source, params ValidationTag[] tags)
        {
            return GlobalValidator.Validate(source, tags);
        }

        public static void AssertIsValid(this object source, params ValidationTag[] tags)
        {
            if (source.Validate(tags).Count() > 0)
            {
                throw new ValidationFailureException(source, source.Validate(tags));
            }
        }

        public static void AssertIsValid(this object source)
        {
            if (source.Validate().Count() > 0)
            {
                throw new ValidationFailureException(source, source.Validate());
            }
        }

        public static bool IsValid(this object source, params ValidationTag[] tags)
        {
            return source.Validate(tags).Count() == 0;
        }

        public static bool IsValid(this object source)
        {
            return source.Validate().Count() == 0;
        }
    }
}
