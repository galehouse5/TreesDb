using System;
using System.Web.Mvc;
using TMD.Model.Photos;

namespace TMD.Extensions
{
    public static class PhotoExtensions
    {
        public static MvcHtmlString Photo(this HtmlHelper html, IPhoto photo, PhotoSize inlineSize = PhotoSize.SquareThumbnail, PhotoSize zoomableSize = PhotoSize.Large)
        {
            UrlHelper url = new UrlHelper(html.ViewContext.RequestContext);
            switch (inlineSize) 
            {
                case PhotoSize.Thumbnail :
                case PhotoSize.SquareThumbnail :
                    return MvcHtmlString.Create(
                            Tag.Img()
                                .Attr("alt", string.Empty)
                                .Attr("src", url.Action("View", "Photos", new { id = photo.StaticId, size = inlineSize }))
                                .ToString()
                            + 
                            Tag.Div().Css("actions").InnerHtml(
                                html.AnchorButton("View",
                                    url.Action("View", "Photos", new { id = photo.StaticId, size = zoomableSize }),
                                    photo.HasCaption ?
                                        (object)new { @class = "View", rel = "facebox", data_captionurl = url.Action("Caption", "Photos", new { id = photo.CaptionId }) } :
                                        new { @class = "View", rel = "facebox" },
                                    ButtonColor.Orange, ButtonSize.Small)
                            ).ToString()
                        );
                case PhotoSize.Square :
                case PhotoSize.MiniSquare :
                case PhotoSize.MapSquare :
                case PhotoSize.MiniMapSquare :
                    return Tag.A()
                        .Attr("href", url.Action("View", "Photos", new { id = photo.StaticId, size = zoomableSize }))
                        .Attr("rel", "facebox")
                        .If(photo.HasCaption, tag => tag.Attr("data-captionurl", url.Action("Caption", "Photos", new { id = photo.CaptionId })))
                        .InnerHtml(
                            Tag.Img()
                                .Attr("alt", string.Empty)
                                .Attr("src", url.Action("View", "Photos", new { id = photo.StaticId, size = inlineSize }))
                                .ToString()
                        ).ToMvcHtmlString();
                default :
                    return Tag.Img().Attr("src", url.Action("View", "Photos", new { id = photo.StaticId, size = inlineSize })).Attr("alt", string.Empty)
                        .ToMvcHtmlString();
            }
        }

        public static MvcHtmlString RemovablePhoto(this HtmlHelper html, IPhoto photo, PhotoSize inlineSize = PhotoSize.SquareThumbnail, PhotoSize zoomableSize = PhotoSize.Large)
        {
            UrlHelper url = new UrlHelper(html.ViewContext.RequestContext);
            switch (inlineSize)
            {
                case PhotoSize.Thumbnail:
                case PhotoSize.SquareThumbnail:
                    return MvcHtmlString.Create(
                            Tag.Img().Attr("src", url.Action("View", "Photos", new { id = photo.StaticId, size = inlineSize })).Attr("alt", string.Empty).ToString()
                            +
                            Tag.Div().Css("actions")
                                .InnerHtml(html.AnchorButton("View",
                                    url.Action("View", "Photos", new { id = photo.StaticId, size = zoomableSize }),
                                    photo.HasCaption ?
                                        (object)new { @class = "View", rel = "facebox", data_captionurl = url.Action("Caption", "Photos", new { id = photo.CaptionId }) } :
                                        new { @class = "View", rel = "facebox" },
                                    ButtonColor.Orange, ButtonSize.Small)
                                ).InnerText(" ") // space here is needed for proper html rendering
                                .InnerHtml(html.AnchorButton("Remove",
                                    url.Action("Remove", "Photos", new { id = photo.Id }), new { @class = "Remove" }, ButtonColor.Grey, ButtonSize.Small)
                                ).ToString()
                        );
                default:
                    throw new NotImplementedException();
            }
        }
    }
}