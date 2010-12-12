using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.Web.Mvc;
using TMD.Model;
using TMD.Model.Validation;
using TMD.Mappings;

namespace TMD.Extensions
{
    public static class ValidationExtensions
    {
        public static void ValidateMappedModel<TSource, TDestination>(this Controller c, TSource source)
        {
            foreach (var error in ValidationMapper.Map<TSource, TDestination>(source.Validate()))
            {
                c.ModelState.AddModelError(error.PropertyPath ?? "_FORM", error.Message);
            }
        }

        public static void ValidateMappedModel<TSource, TDestination>(this Controller c, TSource source, params Tag[] tags)
        {
            foreach (var error in ValidationMapper.Map<TSource, TDestination>(source.Validate(tags)))
            {
                c.ModelState.AddModelError(error.PropertyPath ?? "_FORM", error.Message);
            }
        }
    }
}