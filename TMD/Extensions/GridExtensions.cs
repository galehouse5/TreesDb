using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using MvcContrib.UI.Grid;
using System.Web.Mvc;
using MvcContrib.Sorting;
using MvcContrib.Pagination;
using TMD.Model;

namespace TMD.Extensions
{
    public class PageModelBase<T> : CustomPagination<T>
        where T : IEntity
    {
        public PageModelBase(PagedList<T> dataSource)
            : base(dataSource.Page, dataSource.PageNumber, dataSource.PageSize, dataSource.TotalItems)
        { }
        public GridSortOptions Sort { get; set; }
    }

    public class DataTablesGridRenderer<T> : HtmlTableGridRenderer<T>
        where T : class 
    {
        public DataTablesGridRenderer()
        { }
        
        public DataTablesGridRenderer(ViewEngineCollection engines)
            : base(engines)
        { }

        protected override void RenderHeaderCellStart(GridColumn<T> column)
        {
            Dictionary<string, object> attributes = new Dictionary<string, object>(column.HeaderAttributes);
            if (IsSortingEnabled && column.Sortable)
            {
                string @class = GridModel.SortOptions.Column == GenerateSortColumnName(column) ?
                    GridModel.SortOptions.Direction == SortDirection.Ascending ? "sorting_asc" : "sorting_desc"
                    : "sorting";
                if (attributes.ContainsKey("class") && (attributes["class"] != null))
                {
                    @class = string.Join(" ", new string[] { attributes["class"].ToString(), @class });
                }
                attributes["class"] = @class;
            }
            string compositeAttributes = this.BuildHtmlAttributes(attributes);
            if (compositeAttributes.Length > 0)
            {
                compositeAttributes = " " + compositeAttributes;
            }
            base.RenderText(string.Format("<th{0}>", compositeAttributes));
        }
    }
}