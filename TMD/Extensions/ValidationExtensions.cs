using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.Web.Mvc;
using TMD.Model;
using TMD.Model.Validation;
using TMD.Mappings;
using System.ComponentModel.DataAnnotations;

namespace TMD.Extensions
{
    public static class ValidationExtensions
    {
        public static void ValidateMappedModel<TSource, TDestination>(this Controller c, TSource source)
        {
            foreach (var error in ValidationMapper.Map<TSource, TDestination>(source.Validate()))
            {
                c.ModelState.AddModelError(error.PropertyPath, error.Message);
            }
        }

        public static void ValidateMappedModel<TSource, TDestination>(this Controller c, TSource source, params ValidationTag[] tags)
        {
            foreach (var error in ValidationMapper.Map<TSource, TDestination>(source.Validate(tags)))
            {
                c.ModelState.AddModelError(error.PropertyPath, error.Message);
            }
        }

        public static void ValidateMappedModel<TSource, TDestination>(this Controller c, TSource source, string prefix)
        {
            foreach (var error in ValidationMapper.Map<TSource, TDestination>(source.Validate()))
            {
                c.ModelState.AddModelError(prefix + error.PropertyPath, error.Message);
            }
        }

        public static void ValidateMappedModel<TSource, TDestination>(this Controller c, TSource source, string prefix, params ValidationTag[] tags)
        {
            foreach (var error in ValidationMapper.Map<TSource, TDestination>(source.Validate(tags)))
            {
                c.ModelState.AddModelError(prefix + error.PropertyPath, error.Message);
            }
        }
    }

    public class EmailAttribute : RegularExpressionAttribute
    {
        private const string ATOM = "[^\\x00-\\x1F^\\(^\\)^\\<^\\>^\\@^\\,^\\;^\\:^\\\\^\\\"^\\.^\\[^\\]^\\s]";
        private const string DOMAIN = "([^\\x00-\\x1F^\\(^\\)^\\<^\\>^\\@^\\,^\\;^\\:^\\\\^\\\"^\\.^\\[^\\]^\\s]+(\\.[^\\x00-\\x1F^\\(^\\)^\\<^\\>^\\@^\\,^\\;^\\:^\\\\^\\\"^\\.^\\[^\\]^\\s]+)*";
        private const string IP_DOMAIN = @"\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\]";

        public EmailAttribute()
            : base("^" + ATOM + @"+(\." + ATOM + "+)*@" + DOMAIN + "|" + IP_DOMAIN + ")$")
        {
            ErrorMessage = "You must enter a valid email.";
        }
    }

    public class SkipValidationAttribute : ActionFilterAttribute
    {
        public override void OnActionExecuting(ActionExecutingContext filterContext)
        {
            foreach (var modelState in ((Controller)filterContext.Controller).ModelState)
            {
                modelState.Value.Errors.Clear();
            }
        }
    }
}