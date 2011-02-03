using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.Web.Mvc;
using System.Linq.Expressions;
using System.Web.Mvc.Html;

namespace TMD.Extensions
{
    public static class EditorExtensions
    {
        public static MvcHtmlString FieldEditorFor<TModel, TValue>(this HtmlHelper<TModel> html, Expression<Func<TModel, TValue>> expression)
        {
            return FieldEditorFor(html, expression, null);
        }

        public static MvcHtmlString FieldEditorFor<TModel, TValue>(this HtmlHelper<TModel> html, Expression<Func<TModel, TValue>> expression, object htmlAttributes)
        {
            if (html.ViewData.ModelMetadata.HideSurroundingHtml)
            {
                return html.EditorFor(expression);
            }
            var expressionMetadata = ModelMetadata.FromLambdaExpression(expression, html.ViewData);
            return Tag.Div().Css("field")
                .If(!string.IsNullOrEmpty(expressionMetadata.Classification()),
                    tag => tag.Css(expressionMetadata.Classification()))
                .InnerHtml(html.FieldLabelFor(expression))
                .InnerHtml(Tag.Div()
                    .InnerHtml(Tag.Span().Css("input")
                        .InnerHtml(html.EditorFor(expression, htmlAttributes))
                        .InnerHtml(html.ValidationMessageFor(expression))
                    )
                )
                .If(!string.IsNullOrEmpty(expressionMetadata.Description),
                    tag => tag.InnerHtml(Tag.P().Css("field_help").InnerText(expressionMetadata.Description)))
                .ToMvcHtmlString();
        }
    }
}