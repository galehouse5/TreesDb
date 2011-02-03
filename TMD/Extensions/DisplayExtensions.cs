using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.Web.Mvc;
using System.Linq.Expressions;
using System.Web.Mvc.Html;
using TMD.Model;

namespace TMD.Extensions
{
    public static class DisplayExtensions
    {
        public static MvcHtmlString ReportDisplayFor<TModel, TValue>(this HtmlHelper<TModel> html, Expression<Func<TModel, TValue>> expression)
        {
            if (html.ViewData.ModelMetadata.HideSurroundingHtml)
            {
                return html.EditorFor(expression);
            }
            var expressionMetadata = ModelMetadata.FromLambdaExpression(expression, html.ViewData);
            return Tag.TR()
                .InnerHtml(Tag.TD().Css("description")
                    .InnerText(expressionMetadata.GetDisplayName())
                )
                .InnerHtml(Tag.TD().Css("value")
                    .IfElse(expressionMetadata.IsModelNull(),
                        tag1 => tag1.InnerHtml(expressionMetadata.NullDisplayText),
                        tag1 =>
                    tag1.IfElse(!expressionMetadata.IsEmphasized().HasValue || expressionMetadata.IsEmphasized().Value,
                            tag2 => tag2.InnerHtml(Tag.Span().InnerHtml(html.DisplayFor(expression))),
                            tag2 => tag2.InnerHtml(html.DisplayFor(expression)))
                    )
                )
                .ToMvcHtmlString();
        }

        public static MvcHtmlString IfSpecifiedReportDisplayFor<TModel, TValue>(this HtmlHelper<TModel> html, Expression<Func<TModel, TValue>> expression)
        {
            var expressionMetadata = ModelMetadata.FromLambdaExpression(expression, html.ViewData);
            if (expressionMetadata.IsModelNull())
            {
                return MvcHtmlString.Empty;
            }
            return ReportDisplayFor(html, expression);
        }

        public static MvcHtmlString SummaryDisplayFor<TModel, TValue>(this HtmlHelper<TModel> html, Expression<Func<TModel, TValue>> expression)
        {
            if (html.ViewData.ModelMetadata.HideSurroundingHtml)
            {
                return html.EditorFor(expression);
            }
            var expressionMetadata = ModelMetadata.FromLambdaExpression(expression, html.ViewData);
            return Tag.LI()
                .InnerHtml(Tag.Strong()
                    .InnerText(expressionMetadata.GetDisplayName()).InnerText(":")
                )
                .InnerText(" ")
                .IfElse(expressionMetadata.IsModelNull(),
                    tag => tag.InnerHtml(expressionMetadata.NullDisplayText),
                    tag => tag.InnerHtml(html.DisplayFor(expression))
                )
                .ToMvcHtmlString();
        }

        public static MvcHtmlString IfSpecifiedSummaryDisplayFor<TModel, TValue>(this HtmlHelper<TModel> html, Expression<Func<TModel, TValue>> expression)
        {
            var expressionMetadata = ModelMetadata.FromLambdaExpression(expression, html.ViewData);
            if (expressionMetadata.IsModelNull())
            {
                return MvcHtmlString.Empty;
            }
            return SummaryDisplayFor(html, expression);
        }
    }
}