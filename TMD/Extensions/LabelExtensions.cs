using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.Web.Mvc;
using System.Linq.Expressions;
using System.Text;
using System.Web.Mvc.Html;

namespace TMD.Extensions
{
    public static class LabelExtensions
    {
        public static MvcHtmlString FieldLabelFor<TModel, TValue>(this HtmlHelper<TModel> html, Expression<Func<TModel, TValue>> expression)
        {
            return FieldLabelFor(html, expression, null);
        }

        public static MvcHtmlString FieldLabelFor<TModel, TValue>(this HtmlHelper<TModel> html, Expression<Func<TModel, TValue>> expression, object additionalViewData)
        {
            var expressionMetadata = ModelMetadata.FromLambdaExpression(expression, html.ViewData);
            return Tag.Label()
                .Attr("for", html.ViewData.TemplateInfo.GetFullHtmlFieldId(ExpressionHelper.GetExpressionText(expression)))
                .InnerText(expressionMetadata.DisplayName ?? expressionMetadata.PropertyName)
                .If(expressionMetadata.IsRequired,
                    tag => tag.InnerHtml(Tag.EM().Css("required").InnerText("*")))
                .If(additionalViewData != null,
                    tag => tag.Attrs(additionalViewData.ToPropertyDictionary(), true))
                .ToMvcHtmlString();
        }
    }
}