using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.Web.Mvc;
using System.Linq.Expressions;
using Recaptcha;

namespace TMD.Extensions
{
    public static class CaptchaExtensions
    {
        public static MvcHtmlString CaptchaFor<TModel, TValue>(this HtmlHelper<TModel> html, Expression<Func<TModel, TValue>> expression)
        {
            return Tag.Div().Css("field").Css("captcha")
                .InnerHtml(html.FieldLabelFor(expression))
                .InnerHtml(Tag.Div()
                    .InnerHtml(Tag.Span().Css("input").Attr("style", "height: 128px; width: 312px;")
                        .InnerHtml(html.GenerateCaptcha(string.Empty, "blackglass"))
                    )
                )
                .ToMvcHtmlString();
        }
    }
}