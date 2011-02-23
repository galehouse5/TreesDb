using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.Web.Helpers;
using System.Text;
using System.Collections.Specialized;
using System.Web.Mvc;

namespace TMD.Extensions
{
    public class WebGridOptions
    {
        public int? page { get; set; }
        public int? size { get; set; }
        public string sort { get; set; }
        public SortDirection? sortdir { get; set; }

        public WebGridOptions SetPage(int page) { this.page = page; return this; }
        public WebGridOptions SetSize(int size) { this.size = size; this.page = null; return this; }
        public WebGridOptions SetSort(string sort) { this.sort = sort; this.page = null; return this; }
        public WebGridOptions SetSortDirection(SortDirection sortdir) { this.sortdir = sortdir; return this; }

        public override string ToString()
        {
            NameValueCollection querystring = new NameValueCollection();
            if (page.HasValue) { querystring.Set("page", page.Value.ToString()); }
            if (size.HasValue) { querystring.Set("size", size.Value.ToString()); }
            if (!string.IsNullOrEmpty(sort)) { querystring.Set("sort", sort); }
            if (sortdir.HasValue) { querystring.Set("sortdir", sortdir.Value.ToString()); }
            return querystring.ToQueryString();
        }
    }

    public static class WebGridExtensions
    {
        public static IHtmlString ExternalPager(this WebGrid grid)
        {
            return MvcHtmlString.Create(
                Tag.Div().Css("dataTables_info")
                .IfElse(grid.PageIndex >= 0,
                    ifTag => ifTag.InnerText("Showing {0} to {1} of {2} entries",
                        grid.PageIndex * grid.RowsPerPage + 1,
                        grid.PageIndex * grid.RowsPerPage + grid.Rows.Count,
                        grid.TotalRowCount),
                    elseTag => elseTag.InnerText("No entries")
                )
                .ToString()
                +
                Tag.Div().Css("dataTables_paginate paging_two_button")
                .IfElse(grid.PageIndex <= 0,
                    ifTag => ifTag.InnerHtml(
                        Tag.Div().Css("paginate_disabled_previous").Attr("title", "Previous")
                    ),
                    elseTag => elseTag.InnerHtml(
                        Tag.A().Css("paginate_enabled_previous").Attr("title", "Previous")
                        .Attr("href", grid.GetPageUrl(grid.PageIndex - 1))
                    )
                )
                .IfElse(grid.PageIndex + 1 >= grid.PageCount,
                    ifTag => ifTag.InnerHtml(
                        Tag.Div().Css("paginate_disabled_next").Attr("title", "Next")
                    ),
                    elseTag => elseTag.InnerHtml(
                        Tag.A().Css("paginate_enabled_next").Attr("title", "Next")
                        .Attr("href", grid.GetPageUrl(grid.PageIndex + 1))
                    )
                ).ToString());
        }


        public static WebGridOptions GetOptions(this WebGrid grid)
        {
            return new WebGridOptions
            {
                page = grid.PageIndex,
                size = grid.RowsPerPage,
                sort = grid.SortColumn,
                sortdir = grid.SortDirection
            };
        }
    }
}