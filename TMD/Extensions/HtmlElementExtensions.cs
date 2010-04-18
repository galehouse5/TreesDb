using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.Web.Mvc;
using System.Linq.Expressions;
using System.ComponentModel.DataAnnotations;
using System.Web.Mvc.Html;
using System.Web.Routing;

namespace TMD.Extensions
{
    public static class HtmlElementExtensions
    {
        public static MvcHtmlString CustomTextBoxFor<TModel, TProperty>(
            this HtmlHelper<TModel> htmlHelper,
            Expression<Func<TModel, TProperty>> expression)
        {
            var member = expression.Body as MemberExpression;
            var stringLength = member.Member
                .GetCustomAttributes(typeof(StringLengthAttribute), false)
                .FirstOrDefault() as StringLengthAttribute;
            var attributes = (IDictionary<string, object>)new RouteValueDictionary();
            if (stringLength != null)
            {
                attributes.Add("maxlength", stringLength.MaximumLength);
            }
            return htmlHelper.TextBoxFor(expression, attributes);
        }

        public static MvcHtmlString CustomTextBoxFor<TModel, TProperty>(
            this HtmlHelper<TModel> htmlHelper,
            Expression<Func<TModel, TProperty>> expression,
            object htmlAttributes)
        {
            var member = expression.Body as MemberExpression;
            var stringLength = member.Member
                .GetCustomAttributes(typeof(StringLengthAttribute), false)
                .FirstOrDefault() as StringLengthAttribute;
            var attributes = (IDictionary<string, object>)new RouteValueDictionary(htmlAttributes);
            if (stringLength != null)
            {
                attributes.Add("maxlength", stringLength.MaximumLength);
            }
            return htmlHelper.TextBoxFor(expression, attributes);
        }

        public static MvcHtmlString CustomTextAreaFor<TModel, TProperty>(
            this HtmlHelper<TModel> htmlHelper,
            Expression<Func<TModel, TProperty>> expression,
            int rows,
            int columns,
            object htmlAttributes)
        {
            var member = expression.Body as MemberExpression;
            var stringLength = member.Member
                .GetCustomAttributes(typeof(StringLengthAttribute), false)
                .FirstOrDefault() as StringLengthAttribute;
            var attributes = (IDictionary<string, object>)new RouteValueDictionary(htmlAttributes);
            if (stringLength != null)
            {
                attributes.Add("maxlength", stringLength.MaximumLength);
            }
            return htmlHelper.TextAreaFor(expression, rows, columns, attributes);
        }
    }
}