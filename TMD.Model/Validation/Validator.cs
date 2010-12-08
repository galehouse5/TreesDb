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

        public static IClassValidator GetClassValidator(this object source)
        {
            if (source is Type)
            {
                return s_VE.GetClassValidator((Type)source);
            }
            return s_VE.GetClassValidator(source.GetType());
        }

        public static InvalidValue[] Validate(this object source, params Tag[] tags)
        {
            if (source is InvalidValue[])
            {
                List<InvalidValue> ivs = new List<InvalidValue>();
                foreach (InvalidValue iv in ((InvalidValue[])source))
                {
                    foreach (Tag tag in iv.MatchTags)
                    {
                        if (tags.Contains(tag))
                        {
                            ivs.Add(iv);
                            break;
                        }
                    }
                }
                return ivs.ToArray();
            }
            object[] normalizedTags = new object[tags.Length];
            tags.CopyTo(normalizedTags, 0);
            return s_VE.Validate(source, normalizedTags);
        }

        public static InvalidValue[] Validate(this object source)
        {
            if (source is InvalidValue[])
            {
                return (InvalidValue[])source;
            }
            return s_VE.Validate(source);
        }

        public static void AssertIsValid(this object source, params Tag[] tags)
        {
            InvalidValue[] ivs = source.Validate(tags);
            if (ivs.Length > 0)
            {
                throw new ValidationFailureException(source, ivs); 
            }
        }

        public static void AssertIsValid(this object source)
        {
            InvalidValue[] ivs = source.Validate();
            if (ivs.Length > 0)
            {
                throw new ValidationFailureException(source, ivs);
            }
        }

        public static bool IsValid(this object source, params Tag[] tags)
        {
            InvalidValue[] ivs = source.Validate(tags);
            return ivs.Length == 0;
        }

        public static bool IsValid(this object source)
        {
            InvalidValue[] ivs = source.Validate();
            return ivs.Length == 0;
        }

        public static bool IsValidToPersist(this object source)
        {
            return source.IsValidToPersist();
        }

        public static void AssertIsValidToPersist(this object source)
        {
            source.AssertIsValid(Tag.Persistence);
        }
    }
}
