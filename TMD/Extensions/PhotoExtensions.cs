﻿using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.Web.Mvc;
using System.Text;
using TMD.Model.Photos;

namespace TMD.Extensions
{
    public static class PhotoExtensions
    {
        public static MvcHtmlString Photo(this HtmlHelper html, IPhoto photo, PhotoSize inlineSize = PhotoSize.SquareThumbnail, PhotoSize zoomableSize = PhotoSize.Original)
        {
            UrlHelper url = new UrlHelper(html.ViewContext.RequestContext);
            switch (inlineSize) 
            {
                case PhotoSize.Thumbnail :
                case PhotoSize.SquareThumbnail :
                    return MvcHtmlString.Create(
                            Tag.Img().Attr("src", url.Action(Mvc.Photos.ViewPhoto(photo.PhotoId, inlineSize))).Attr("alt", string.Empty).ToString()
                            + 
                            Tag.Div().Css("actions").InnerHtml(
                                html.AnchorButton("View", url.Action(Mvc.Photos.ViewPhoto(photo.PhotoId, zoomableSize)), new { @class = "View", rel = "facebox" }, ButtonColor.Orange, ButtonSize.Small)
                            ).ToString()
                        );
                case PhotoSize.Square :
                case PhotoSize.MiniSquare :
                case PhotoSize.MapSquare :
                case PhotoSize.MiniMapSquare :
                    return Tag.A().Attr("href", url.Action(Mvc.Photos.ViewPhoto(photo.PhotoId, zoomableSize))).Attr("rel", "facebox").InnerHtml(
                            Tag.Img().Attr("src", url.Action(Mvc.Photos.ViewPhoto(photo.PhotoId, inlineSize))).Attr("alt", string.Empty)
                        ).ToMvcHtmlString();
                default :
                    return Tag.Img().Attr("src", url.Action(Mvc.Photos.ViewPhoto(photo.PhotoId, inlineSize))).Attr("alt", string.Empty)
                        .ToMvcHtmlString();
            }
        }

        public static MvcHtmlString RemovablePhoto(this HtmlHelper html, IPhoto photo, PhotoSize inlineSize = PhotoSize.SquareThumbnail, PhotoSize zoomableSize = PhotoSize.Original)
        {
            UrlHelper url = new UrlHelper(html.ViewContext.RequestContext);
            switch (inlineSize)
            {
                case PhotoSize.Thumbnail:
                case PhotoSize.SquareThumbnail:
                    return MvcHtmlString.Create(
                            Tag.Img().Attr("src", url.Action(Mvc.Photos.ViewPhoto(photo.PhotoId, inlineSize))).Attr("alt", string.Empty).ToString()
                            +
                            Tag.Div().Css("actions")
                                .InnerHtml(html.AnchorButton("View", 
                                    url.Action(Mvc.Photos.ViewPhoto(photo.PhotoId, zoomableSize)), new { @class = "View", rel = "facebox" }, ButtonColor.Orange, ButtonSize.Small)
                                ).InnerText(" ") // space here is needed for proper html rendering
                                .InnerHtml(html.AnchorButton("Remove", 
                                    url.Action(Mvc.Photos.Remove(null, photo.Id)), new { @class = "Remove" }, ButtonColor.Grey, ButtonSize.Small)
                                ).ToString()
                        );
                default:
                    throw new NotImplementedException();
            }
        }
    }
}