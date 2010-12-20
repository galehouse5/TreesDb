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
            string et = ExpressionHelper.GetExpressionText((LambdaExpression)expression);
            return html.ViewContext.ViewData.TemplateInfo.GetFullHtmlFieldId(et);
        }

        public static string GetLabelInnerText<TModel, TValue>(this HtmlHelper<TModel> html, Expression<Func<TModel, TValue>> expression)
        {
            ModelMetadata md = ModelMetadata.FromLambdaExpression<TModel, TValue>(expression, html.ViewData);
            string et = ExpressionHelper.GetExpressionText((LambdaExpression)expression);
            return md.DisplayName ?? (md.PropertyName ?? et.Split(new char[] { '.' }).Last<string>());
        }
    }
}