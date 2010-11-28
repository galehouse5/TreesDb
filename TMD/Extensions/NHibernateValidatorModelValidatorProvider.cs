using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.Web.Mvc;
using NHibernate.Validator.Engine;
using NHibernate.Validator.Constraints;
using TMD.Model.Validation;

namespace TMD.Extensions
{
    public class NHibernateValidatorModelValidatorProvider : ModelValidatorProvider
    {
        public override IEnumerable<ModelValidator> GetValidators(ModelMetadata metadata, ControllerContext context)
        {
            if (metadata.ContainerType != null)
            {
                var cv = Validator.GetClassValidator(metadata.ContainerType);
                if (cv != null)
                {
                    yield return new NHibernateValidatorModelValidator(metadata, context, cv);
                }
            }
        }
    }

    public class NHibernateValidatorModelValidator : ModelValidator
    {
        public NHibernateValidatorModelValidator(ModelMetadata metadata, ControllerContext context, IClassValidator cv)
            : base(metadata, context)
        {
            ClassValidator = cv;
            PropertyName = metadata.PropertyName;
        }

        public string PropertyName { get; private set; }
        public IClassValidator ClassValidator { get; private set; }

        public override IEnumerable<ModelValidationResult> Validate(object container)
        {
            var ivs = ClassValidator.GetInvalidValues(container, PropertyName);
            foreach (var iv in ivs)
            {
                yield return new NHibernateValidatorValidationResult(iv);
            }
        }
    }

    public class NHibernateValidatorValidationResult : ModelValidationResult
    {
        public NHibernateValidatorValidationResult(InvalidValue iv)
        {
            InvalidValue = iv;
            MemberName = string.Empty;
            Message = iv.Message;
        }

        public InvalidValue InvalidValue { get; private set; }
    }
}