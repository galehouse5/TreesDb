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

        private static readonly char[] s_TagSplitters = new char[] { ',', ' ' };
        public static ValidationResults FindAllContainingTag(this ValidationResults results, TagFilter tagFilter, params string[] tags)
        {
            ValidationResults filteredResults = new ValidationResults();
            foreach (ValidationResult result in results)
            {
                if (!string.IsNullOrEmpty(result.Tag))
                {
                    string[] containedTags = result.Tag.Split(s_TagSplitters, StringSplitOptions.RemoveEmptyEntries);
                    bool resultContainsTag = false;
                    for (int i = 0; i < tags.Length && !resultContainsTag; i++)
                    {
                        string tag = tags[i];
                        for (int j = 0; j < containedTags.Length && !resultContainsTag; j++)
                        {
                            string containedTag = containedTags[j];
                            if (tag == containedTag)
                            {
                                resultContainsTag = true;
                            }
                        }
                    }
                    if (resultContainsTag && tagFilter == TagFilter.Include
                        || !resultContainsTag && tagFilter == TagFilter.Ignore)
                    {
                        filteredResults.AddResult(result);
                    }
                }
            }
            return filteredResults;
        }
    }
}
