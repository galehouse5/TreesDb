using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using Microsoft.Practices.EnterpriseLibrary.Validation;
using System.Web.Mvc;
using TMD.Model;

namespace TMD.Extensions
{
    public static class ValidationExtensions
    {
        public static void CopyToModelState(this ValidationResults results, ModelStateDictionary modelState)
        {
            foreach (ValidationResult result in results)
            {
                modelState.AddModelError(result.Key ?? "_FORM", result.Message);
            }
        }

        public static void CopyToModelState(this ValidationResults results, ModelStateDictionary modelState, string formElementNamespace)
        {
            foreach (ValidationResult result in results)
            {
                modelState.AddModelError(result.Key == null ? "_FORM" : string.Format("{0}.{1}", formElementNamespace, result.Key), result.Message);
            }
        }

        public static void CopyToModelState(this ValidationResults results, ModelStateDictionary modelState, string formElementNamespace, string appendQualification)
        {
            foreach (ValidationResult result in results)
            {
                modelState.AddModelError(result.Key == null ? "_FORM" : string.Format("{0}.{1}.{2}", formElementNamespace, result.Key, appendQualification), result.Message);
            }
        }
    }
}