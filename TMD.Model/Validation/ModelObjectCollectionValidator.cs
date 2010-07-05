using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using Microsoft.Practices.EnterpriseLibrary.Validation.Validators;
using Microsoft.Practices.EnterpriseLibrary.Validation;
using System.Collections;
using Microsoft.Practices.EnterpriseLibrary.Validation.Properties;

namespace TMD.Model.Validation
{
    public enum CollectionNamespaceQualificationMode
    {
        None,
        PrependToKeyAndIndex,
        ReplaceKeyAndIndex
    }

    public class ModelObjectCollectionValidatorAttribute : ValidatorAttribute
    {
        public ModelObjectCollectionValidatorAttribute(CollectionNamespaceQualificationMode mode)
            : this(mode, null, string.Empty)
        { }

        public ModelObjectCollectionValidatorAttribute(CollectionNamespaceQualificationMode mode, Type targetType)
            : this(mode, targetType, string.Empty)
        { }

        public ModelObjectCollectionValidatorAttribute(CollectionNamespaceQualificationMode mode, Type targetType, string targetRuleset)
        {
            this.Mode = mode;
            this.TargetType = targetType;
            this.TargetRuleset = targetRuleset;
        }

        public CollectionNamespaceQualificationMode Mode { get; private set; }
        public Type TargetType { get; private set; }
        public string TargetRuleset { get; set; }

        protected override Validator DoCreateValidator(Type targetType)
        {
            throw new NotImplementedException();
        }

        protected override Validator DoCreateValidator(Type targetType, Type ownerType, MemberValueAccessBuilder memberValueAccessBuilder, ValidatorFactory validatorFactory)
        {
            if (this.TargetType != null)
            {
                return new ModelObjectCollectionValidator(Mode, targetType, validatorFactory, TargetRuleset);
            }
            return new ModelObjectCollectionValidator(Mode, validatorFactory, TargetRuleset);
        }
    }

    public class ModelObjectCollectionValidator : Validator
    {
        // Fields
        private readonly string targetRuleset;
        private readonly Type targetType;
        private readonly Validator targetTypeValidator;
        private readonly ValidatorFactory validatorFactory;

        // Methods
        public ModelObjectCollectionValidator(CollectionNamespaceQualificationMode mode)
            : this(mode, ValidationFactory.DefaultCompositeValidatorFactory)
        {
        }

        public ModelObjectCollectionValidator(CollectionNamespaceQualificationMode mode, ValidatorFactory validatorFactory)
            : this(mode, validatorFactory, string.Empty)
        {
        }

        public ModelObjectCollectionValidator(CollectionNamespaceQualificationMode mode, Type targetType)
            : this(mode, targetType, string.Empty)
        {
        }

        public ModelObjectCollectionValidator(CollectionNamespaceQualificationMode mode, ValidatorFactory validatorFactory, string targetRuleset)
            : base(null, null)
        {
            if (validatorFactory == null)
            {
                throw new ArgumentNullException("validatorFactory");
            }
            if (targetRuleset == null)
            {
                throw new ArgumentNullException("targetRuleset");
            }
            this.targetType = null;
            this.targetTypeValidator = null;
            this.targetRuleset = targetRuleset;
            this.validatorFactory = validatorFactory;
            this.Mode = mode;
        }

        public ModelObjectCollectionValidator(CollectionNamespaceQualificationMode mode, Type targetType, string targetRuleset)
            : this(mode, targetType, ValidationFactory.DefaultCompositeValidatorFactory, targetRuleset)
        {
        }

        public ModelObjectCollectionValidator(CollectionNamespaceQualificationMode mode, Type targetType, ValidatorFactory validatorFactory, string targetRuleset)
            : base(null, null)
        {
            if (targetType == null)
            {
                throw new ArgumentNullException("targetType");
            }
            if (targetRuleset == null)
            {
                throw new ArgumentNullException("targetRuleset");
            }
            if (validatorFactory == null)
            {
                throw new ArgumentNullException("validatorFactory");
            }
            this.targetType = targetType;
            this.targetTypeValidator = validatorFactory.CreateValidator(targetType, targetRuleset);
            this.targetRuleset = targetRuleset;
            this.validatorFactory = null;
            this.Mode = mode;
        }

        public override void DoValidate(object objectToValidate, object currentTarget, string key, ValidationResults validationResults)
        {
            if (objectToValidate != null)
            {
                IEnumerable enumerable = objectToValidate as IEnumerable;
                if (enumerable != null)
                {
                    int index = 0;
                    foreach (object element in enumerable)
                    {
                        if (element == null)
                        {
                            index++;
                            continue;
                        }
                        Type elementType = element.GetType();
                        if ((this.targetType == null) || this.targetType.IsAssignableFrom(elementType))
                        {
                            ValidationResults validationResultsNeedingNamespaceQualification = new ValidationResults();
                            this.GetValidator(elementType).DoValidate(element, element, null, validationResultsNeedingNamespaceQualification);
                            foreach (ValidationResult vr in validationResultsNeedingNamespaceQualification)
                            {
                                switch (Mode)
                                {
                                    case CollectionNamespaceQualificationMode.PrependToKeyAndIndex:
                                        vr.SetPrivateFieldValue("key", string.Format("{0}[{1}].{2}", key, index, vr.Key));
                                        break;
                                    case CollectionNamespaceQualificationMode.ReplaceKeyAndIndex:
                                        vr.SetPrivateFieldValue("key", string.Format("{0}[{1}]", key, index));
                                        break;
                                    default:
                                        break;
                                }
                            }
                            validationResults.AddAllResults(validationResultsNeedingNamespaceQualification);
                            index++;
                            continue;
                        }
                        base.LogValidationResult(validationResults, Resources.ObjectCollectionValidatorIncompatibleElementInTargetCollection, element, null);
                    }
                }
                else
                {
                    base.LogValidationResult(validationResults, Resources.ObjectCollectionValidatorTargetNotCollection, currentTarget, key);
                }
            }
        }

        private Validator GetValidator(Type elementType)
        {
            if (this.targetTypeValidator != null)
            {
                return this.targetTypeValidator;
            }
            return this.validatorFactory.CreateValidator(elementType, this.targetRuleset);
        }

        // Properties
        protected override string DefaultMessageTemplate { get { return null; } }
        public string TargetRuleset { get { return this.targetRuleset; } }
        public Type TargetType { get { return this.targetType; } }
        public CollectionNamespaceQualificationMode Mode { get; private set; }








        //public ModelObjectCollectionValidator(CollectionNamespaceQualificationMode mode)
        //    : base()
        //{
        //    Mode = mode;
        //}

        //public ModelObjectCollectionValidator(CollectionNamespaceQualificationMode mode, ValidatorFactory validatorFactory)
        //    : base(validatorFactory)
        //{
        //    Mode = mode;
        //}

        //public ModelObjectCollectionValidator(CollectionNamespaceQualificationMode mode, Type targetType)
        //    : base(targetType)
        //{
        //    Mode = mode;
        //}

        //public ModelObjectCollectionValidator(CollectionNamespaceQualificationMode mode, ValidatorFactory validatorFactory, string targetRuleset)
        //    : base(validatorFactory, targetRuleset)
        //{
        //    Mode = mode;
        //}

        //public ModelObjectCollectionValidator(CollectionNamespaceQualificationMode mode, Type targetType, string targetRuleset)
        //    : base(targetType, targetRuleset)
        //{
        //    Mode = mode;
        //}

        //public ModelObjectCollectionValidator(CollectionNamespaceQualificationMode mode, Type targetType, ValidatorFactory validatorFactory, string targetRuleset)
        //    : base(targetType, validatorFactory, targetRuleset)
        //{
        //    Mode = mode;

        //}

        //public CollectionNamespaceQualificationMode Mode { get; private set; }

        //public override void DoValidate(object objectToValidate, object currentTarget, string key, ValidationResults validationResults)
        //{
        //    if (objectToValidate != null)
        //    {
        //        IEnumerable enumerable = objectToValidate as IEnumerable;
        //        if (enumerable != null)
        //        {
        //            foreach (object element in enumerable)
        //            {
        //                if (element == null)
        //                {
        //                    continue;
        //                }
        //                Type elementType = element.GetType();
        //                if ((base.TargetType == null) || base.TargetType.IsAssignableFrom(elementType))
        //                {
        //                    this.getValidator(elementType).DoValidate(element, element, null, validationResults);
        //                    continue;
        //                }
        //                base.LogValidationResult(validationResults, Resources.ObjectCollectionValidatorIncompatibleElementInTargetCollection, element, null);
        //            }
        //        }
        //        else
        //        {
        //            base.LogValidationResult(validationResults, Resources.ObjectCollectionValidatorTargetNotCollection, currentTarget, key);
        //        }
        //    }
        //}

        //private Validator getValidator(Type elementType)
        //{
        //    if (this.targetTypeValidator != null)
        //    {
        //        return this.targetTypeValidator;
        //    }
        //    return this.validatorFactory.CreateValidator(elementType, this.TargetRuleset);
        //}

            

 





            //ValidationResults baseResults = new ValidationResults();
            //base.DoValidate(objectToValidate, currentTarget, key, baseResults);
            //int index = 0;
            //foreach (object obj in (IEnumerable)objectToValidate)
            //{
            //    foreach (ValidationResult vr in baseResults)
            //    {
            //        if (vr.Target == obj)
            //        {
            //            switch (Mode)
            //            {
            //                case CollectionNamespaceQualificationMode.PrependToKeyAndIndex:
            //                    vr.SetPrivateFieldValue("key", string.Format("{0}[{1}].{2}", key, index, vr.Key));
            //                    break;
            //                case CollectionNamespaceQualificationMode.ReplaceKeyAndIndex:
            //                    vr.SetPrivateFieldValue("key", string.Format("{0}[{1}]", key, index));
            //                    break;
            //                default:
            //                    break;
            //            }
            //            validationResults.AddResult(vr);
            //        }
            //    }
            //    index++;
            //}
    }
}
