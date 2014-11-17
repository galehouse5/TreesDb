using System.Web.Mvc;
using TMD.Model.Photo;

namespace TMD.Extensions
{
    public static class PhotoExtensions
    {
        public static MvcHtmlString Photo(this HtmlHelper html, PhotoReference photo, ImageSize inlineSize = null, ImageSize zoomableSize = null)
        {
            inlineSize = inlineSize ?? ImageSize.SquareThumbnail;
            zoomableSize = zoomableSize ?? ImageSize.Large;

            UrlHelper url = new UrlHelper(html.ViewContext.RequestContext);
            if (inlineSize.Equals(ImageSize.Thumbnail) || inlineSize.Equals(ImageSize.SquareThumbnail))
                return MvcHtmlString.Create(
                        Tag.Img()
                            .Attr("alt", string.Empty)
                            .Attr("src", url.Action("View", "Photos", new { id = photo.Id, size = inlineSize }))
                            .ToString()
                        + Tag.Div().Css("actions").InnerHtml(
                            html.AnchorButton("View",
                                url.Action("View", "Photos", new { id = photo.Id, size = zoomableSize }), new
                                {
                                    @class = "View",
                                    rel = "facebox",
                                    data_captionurl = url.Action("Caption", "Photos", new { id = photo.Id })
                                },
                                ButtonColor.Orange, ButtonSize.Small)
                        ).ToString()
                    );

            if (inlineSize.Equals(ImageSize.Square) || inlineSize.Equals(ImageSize.MiniSquare) || inlineSize.Equals(ImageSize.MapSquare) || inlineSize.Equals(ImageSize.MiniMapSquare))
                return Tag.A()
                    .Attr("href", url.Action("View", "Photos", new { id = photo.Id, size = zoomableSize }))
                    .Attr("rel", "facebox")
                    .Attr("data-captionurl", url.Action("Caption", "Photos", new { id = photo.Id }))
                    .InnerHtml(
                        Tag.Img()
                            .Attr("alt", string.Empty)
                            .Attr("src", url.Action("View", "Photos", new { id = photo.Id, size = inlineSize }))
                            .ToString()
                    ).ToMvcHtmlString();

            return Tag.Img().Attr("src", url.Action("View", "Photos", new { id = photo.Id, size = inlineSize })).Attr("alt", string.Empty)
                .ToMvcHtmlString();
        }
    }
}