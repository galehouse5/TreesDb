using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using TMD.Model.Extensions;
using NHibernate.Validator.Engine;

namespace TMD.Model.Validation
{
    public enum Tag
    {
        Screening,
        Persistence,
        Finalization,
        Optional
    }

    public static class Validator
    {
        private static ValidatorEngine s_VE = new ValidatorEngine();

        public static IList<ValidationFailure> Validate(this object source, params Tag[] tags)
        {
            object[] normalizedTags = new object[tags.Length];
            tags.CopyTo(normalizedTags, 0);
            InvalidValue[] invalidValues = s_VE.Validate(source, normalizedTags);
            List<ValidationFailure> validationFailures = new List<ValidationFailure>();
            invalidValues.ForEach(iv => validationFailures.Add(new ValidationFailure(iv)));
            return validationFailures;
        }

        public static void AssertIsValid(this object source, params Tag[] tags)
        {
            IList<ValidationFailure> validationFailures = source as IList<ValidationFailure>;
            if (validationFailures == null)
            {
                validationFailures = source.Validate(tags);
            }
            else
            {
                validationFailures.RemoveUnspecifiedTags(tags);
            }
            if (validationFailures.Count > 0)
            {
                throw new ValidationFailureException(source, validationFailures);
            }
        }

        public static bool IsValid(this object source, params Tag[] tags)
        {
            IList<ValidationFailure> validationFailures = source as IList<ValidationFailure>;
            if (validationFailures != null)
            {
                validationFailures = validationFailures.RemoveUnspecifiedTags(tags);
                return validationFailures.Count == 0;
            }
            return source.Validate(tags).IsValid();
        }

        public static IList<ValidationFailure> Validate(this object source)
        {
            return source.Validate(Tag.Screening, Tag.Persistence, Tag.Finalization, Tag.Optional);
        }

        public static bool IsValid(this object source)
        {
            return source.IsValid(Tag.Screening, Tag.Persistence, Tag.Finalization, Tag.Optional);
        }

        public static void AssertIsValid(this object source)
        {
            source.AssertIsValid(Tag.Screening, Tag.Persistence, Tag.Finalization, Tag.Optional);
        }

        public static void AssertIsValidToPersist(this object source)
        {
            source.AssertIsValid(Tag.Persistence);
        }

        public static IList<ValidationFailure> RemoveUnspecifiedTags(this IList<ValidationFailure> validationFailures, params Tag[] tags)
        {
            return validationFailures.RemoveAll(vf => !vf.ContainsTag(tags));
        }
    }
}
