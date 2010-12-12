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
                var cv = Validator.ClassValidator(metadata.ContainerType);
                if (cv != null)
                {
                    yield return new NHibernateValidatorModelValidator(metadata, context, cv);
                }
            }
        }
    }

    public class NHibernateValidatorModelValidator : ModelValidator
    {
        public NHibernateValidatorModelValidator(ModelMetadata metadata, ControllerContext context, ValidatorBase validator)
            : base(metadata, context)
        {
            this.Validator = validator;
            PropertyName = metadata.PropertyName;
        }

        public string PropertyName { get; private set; }
        public ValidatorBase Validator { get; private set; }

        public override IEnumerable<ModelValidationResult> Validate(object container)
        {
            foreach (var error in Validator.Validate(container).Where(ve => ve.PropertyPath == PropertyName))
            {
                yield return new ValidationErrorResult(error);
            }
        }
    }

    public class ValidationErrorResult : ModelValidationResult
    {
        public ValidationErrorResult(IValidationError error)
        {
            this.Error = error;
            MemberName = string.Empty;
            Message = error.Message;
        }

        public IValidationError Error { get; private set; }

        public InvalidValue InvalidValue { get; private set; }
    }
}