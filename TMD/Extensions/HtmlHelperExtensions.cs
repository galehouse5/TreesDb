using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.Web.Mvc;
using System.Linq.Expressions;

namespace TMD.Extensions
{
    public static class HtmlHelperExtensions
    {
        public static string GetFullHtmlFieldId<TModel, TValue>(this HtmlHelper<TModel> html, Expression<Func<TModel, TValue>> expression)
        {
            var et = ExpressionHelper.GetExpressionText((LambdaExpression)expression);
            return html.ViewContext.ViewData.TemplateInfo.GetFullHtmlFieldId(et);
        }

        public static string GetFullHtmlFieldName<TModel, TValue>(this HtmlHelper<TModel> html, Expression<Func<TModel, TValue>> expression)
        {
            var et = ExpressionHelper.GetExpressionText((LambdaExpression)expression);
            return html.ViewContext.ViewData.TemplateInfo.GetFullHtmlFieldName(et);
        }

        public static string GetLabelInnerText<TModel, TValue>(this HtmlHelper<TModel> html, Expression<Func<TModel, TValue>> expression)
        {
            var md = ModelMetadata.FromLambdaExpression<TModel, TValue>(expression, html.ViewData);
            var et = ExpressionHelper.GetExpressionText((LambdaExpression)expression);
            return md.DisplayName ?? (md.PropertyName ?? et.Split(new char[] { '.' }).Last<string>());
        }
    }
}