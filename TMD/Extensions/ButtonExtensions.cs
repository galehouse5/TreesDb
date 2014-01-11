using System.Web.Mvc;

namespace TMD.Extensions
{
    public enum ButtonColor { Blue, Orange, Red, Green, Black, Purple, Navy, Maroon, Grey, Yellow, Teal, Pink, Default }
    public enum ButtonSize { Small, Medium, Large, Default }
    public enum ButtonIcon { Comment, Heart, Star, Cart, Print, RSS, User, Check, Dollar, Refresh, Home, Plus, Minus, Cross, ArrowLeft, ArrowRight, ArrowUp, ArrowDown, Default }

    public static class ButtonExtensions
    {
        private static Tag AddCss(this Tag tag, ButtonColor color)
        {
            switch (color)
            {
                case ButtonColor.Blue: tag.Css("btn-blue"); break;
                case ButtonColor.Orange: tag.Css("btn-orange"); break;
                case ButtonColor.Red: tag.Css("btn-red"); break;
                case ButtonColor.Green: tag.Css("btn-green"); break;
                case ButtonColor.Black: tag.Css("btn-black"); break;
                case ButtonColor.Purple: tag.Css("btn-purple"); break;
                case ButtonColor.Navy: tag.Css("btn-navy"); break;
                case ButtonColor.Maroon: tag.Css("btn-maroon"); break;
                case ButtonColor.Grey: tag.Css("btn-grey"); break;
                case ButtonColor.Yellow: tag.Css("btn-yellow"); break;
                case ButtonColor.Teal: tag.Css("btn-teal"); break;
                case ButtonColor.Pink: tag.Css("btn-pink"); break;
                case ButtonColor.Default:
                default: break;
            }
            return tag;
        }

        private static Tag AddCss(this Tag tag, ButtonSize size)
        {
            switch (size)
            {
                case ButtonSize.Small: tag.Css("btn-small"); break;
                case ButtonSize.Large: tag.Css("btn-large"); break;
                case ButtonSize.Medium:
                case ButtonSize.Default:
                default: break;
            }
            return tag;
        }

        private static Tag AddCss(this Tag tag, ButtonIcon icon)
        {
            switch (icon)
            {
                case ButtonIcon.Comment: tag.Css("btn-comment"); break;
                case ButtonIcon.Heart: tag.Css("btn-heart"); break;
                case ButtonIcon.Star: tag.Css("btn-star"); break;
                case ButtonIcon.Cart: tag.Css("btn-cart"); break;
                case ButtonIcon.Print: tag.Css("btn-print"); break;
                case ButtonIcon.RSS: tag.Css("btn-rss"); break;
                case ButtonIcon.User: tag.Css("btn-user"); break;
                case ButtonIcon.Check: tag.Css("btn-check"); break;
                case ButtonIcon.Dollar: tag.Css("btn-dollar"); break;
                case ButtonIcon.Refresh: tag.Css("btn-refresh"); break;
                case ButtonIcon.Home: tag.Css("btn-home"); break;
                case ButtonIcon.Plus: tag.Css("btn-plus"); break;
                case ButtonIcon.Minus: tag.Css("btn-minus"); break;
                case ButtonIcon.Cross: tag.Css("btn-cross"); break;
                case ButtonIcon.ArrowLeft: tag.Css("btn-arrow-left"); break;
                case ButtonIcon.ArrowRight: tag.Css("btn-arrow-right"); break;
                case ButtonIcon.ArrowUp: tag.Css("btn-arrow-up"); break;
                case ButtonIcon.ArrowDown: tag.Css("btn-arrow-down"); break;
                case ButtonIcon.Default:
                default: break;
            }
            return tag;
        }

        public static MvcHtmlString SubmitButton(this HtmlHelper html, string text,
            ButtonColor color = ButtonColor.Default, ButtonSize size = ButtonSize.Default, ButtonIcon icon = ButtonIcon.Default)
        {
            return Tag.Button().InnerText(text)
                .Attr("type", "submit")
                .AddCss(color).AddCss(size).AddCss(icon)
                .IfElse(icon == ButtonIcon.Default,
                    tag => tag.Css("btn"),
                    tag => tag.Css("btn-icon"))
                .ToMvcHtmlString();
        }

        public static MvcHtmlString SubmitButton(this HtmlHelper html, string text, string name, string value,
            ButtonColor color = ButtonColor.Default, ButtonSize size = ButtonSize.Default, ButtonIcon icon = ButtonIcon.Default)
        {
            return Tag.Button().InnerText(text)
                .Attr("type", "submit").Attr("name", name).Attr("value", value)
                .AddCss(color).AddCss(size).AddCss(icon)
                .IfElse(icon == ButtonIcon.Default,
                    tag => tag.Css("btn"),
                    tag => tag.Css("btn-icon"))
                .ToMvcHtmlString();
        }

        public static MvcHtmlString AnchorButton(this HtmlHelper html, string text, string href, 
            ButtonColor color = ButtonColor.Default, ButtonSize size = ButtonSize.Default)
        {
            return Tag.A().InnerText(text)
                .AddCss(color).AddCss(size).Css("btn")
                .Attr("href", href)
                .ToMvcHtmlString();
        }

        public static MvcHtmlString AnchorButton(this HtmlHelper html, string text, string actionName, object routeValues, object htmlAttributes, 
            ButtonColor color = ButtonColor.Default, ButtonSize size = ButtonSize.Default)
        {
            UrlHelper url = new UrlHelper(html.ViewContext.RequestContext);
            return AnchorButton(html, text, url.Action(actionName, routeValues), htmlAttributes, color, size);
        }

        public static MvcHtmlString AnchorButton(this HtmlHelper html, string text, string href, object htmlAttributes, 
            ButtonColor color = ButtonColor.Default, ButtonSize size = ButtonSize.Default)
        {
            return Tag.A().InnerText(text)
                .If(htmlAttributes != null,
                    tag => tag.Attrs(htmlAttributes.ToPropertyDictionary(), true))
                .AddCss(color).AddCss(size).Css("btn")
                .Attr("href", href)
                .ToMvcHtmlString();
        }
    }
}