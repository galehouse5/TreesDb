﻿using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.Collections.Specialized;
using System.Globalization;
using System.IO;
using System.Web.WebPages;
using System.Web.Mvc;
using System.Text;
using System.Linq.Expressions;

namespace TMD.Extensions
{
    public static class DataTablesGridExtensions
    {
        public static IHtmlString DataTablesGrid<T>(this HtmlHelper helper,
            Action<DataTablesColumnBuilder<T>> columns = null,
            int? pageIndex = null,
            string parameterNamePrefix = null,
            int? rowsPerPage = null,
            bool? sortAscending = null,
            string sortColumnName = null,
            IEnumerable<T> dataSource = null,
            int? totalRowCount = null,
            int? filteredRowCount = null,
            bool canPage = true)
            where T : class
        {
            var model = new DataTablesGridModel<T>(helper.ViewContext);
            if (columns == null)
            {
                throw new ArgumentException("Expected non null value for columns.");
            }
            var columnBuilder = new DataTablesColumnBuilder<T>();
            columns(columnBuilder);
            model.Columns = columnBuilder.Columns;
            if (pageIndex.HasValue)
            {
                model.PageIndex = pageIndex.Value;
            }
            if (parameterNamePrefix != null)
            {
                model.ParameterNamePrefix = parameterNamePrefix;
            }
            if (rowsPerPage.HasValue)
            {
                model.RowsPerPage = rowsPerPage.Value;
            }
            if (!canPage)
            {
                model.RowsPerPage = int.MaxValue;
            }
            if (sortAscending.HasValue)
            {
                model.SortAscending = sortAscending.Value;
            }
            if (sortColumnName != null)
            {
                model.SortColumnName = sortColumnName;
            }
            if (dataSource == null)
            {
                throw new ArgumentException("Expected non null value for dataSource.");
            }
            int calculatedTotalRowCount = totalRowCount.HasValue ? totalRowCount.Value : dataSource.Count();
            int calculatedFilteredRowCount = filteredRowCount.HasValue ? filteredRowCount.Value : dataSource.Count();
            using (TextWriter output = new StringWriter())
            {
                var render = new DataTablesGridRenderer<T>();
                render.Render(model, dataSource, calculatedFilteredRowCount, calculatedTotalRowCount, output);
                if (canPage)
                {
                    render.RenderPager(model, dataSource, calculatedFilteredRowCount, calculatedTotalRowCount, output);
                }
                return new HtmlString(output.ToString());
            }
        }
    }

    public static class DataTablesGridColumnExtensions
    {
        public static DataTablesGridColumnModel<T> Options<T>(this DataTablesGridColumnModel<T> model, 
            bool? canFilter = null, bool? canSort = null, string columnName = null, bool? encodeValue = null, string header = null, string valueFormat = null)
            where T : class
        {
            if (canFilter.HasValue)
            {
                model.CanFilter = canFilter.Value;
            }
            if (canSort.HasValue)
            {
                model.CanSort = canSort.Value;
            }
            if (columnName != null)
            {
                model.ColumnName = columnName;
            }
            if (encodeValue.HasValue)
            {
                model.EncodeValue = encodeValue.Value;
            }
            if (header != null)
            {
                model.Header = header;
            }
            if (valueFormat != null)
            {
                model.ValueFormat = valueFormat;
            }
            return model;
        }
    }

    public class DataTablesColumnBuilder<T> where T : class
    {
        private List<DataTablesGridColumnModel<T>> m_Columns = new List<DataTablesGridColumnModel<T>>();

        public DataTablesGridColumnModel<T> For(Expression<Func<T, object>> propertySpecifier, string valueFormat = null)
        {
            var column = new DataTablesGridColumnModel<T>
            {
                Evaluator = propertySpecifier.Compile(),
                ColumnName = (propertySpecifier.Body as MemberExpression).Member.Name,
                Header = (propertySpecifier.Body as MemberExpression).Member.Name,
                EncodeValue = true,
                ValueFormat = valueFormat
            };
            m_Columns.Add(column);
            return column;
        }

        public DataTablesGridColumnModel<T> Custom(string columnName, Func<T, object> customRenderer)
        {
            var column = new DataTablesGridColumnModel<T>
            {
                Evaluator = customRenderer,
                ColumnName = columnName,
                Header = columnName
            };
            m_Columns.Add(column);
            return column;
        }

        public IEnumerable<DataTablesGridColumnModel<T>> Columns 
        { 
            get { return m_Columns; } 
        }
    }

    public class DataTablesGridModel<T> where T : class
    {
        private ViewContext m_Context;

        public DataTablesGridModel(ViewContext context)
        {
            m_Context = context;
            RowsPerPage = 10;
        }

        public int RowsPerPage { get; set; }
        public IEnumerable<DataTablesGridColumnModel<T>> Columns { get; set; }
        public string ParameterNamePrefix { get; set; }

        private NameValueCollection Parameters
        {
            get { return m_Context.RequestContext.HttpContext.Request.QueryString;  }
        }

        private string Path
        {
            get { return m_Context.RequestContext.HttpContext.Request.Path; }
        }

        private int? m_PageIndex;
        public int PageIndex 
        {
            get 
            {
                if (m_PageIndex.HasValue)
                {
                    return m_PageIndex.Value;
                }
                int pageIndex;
                if (IsPageParameterSpecified && int.TryParse(Parameters[PageParameterName], out pageIndex))
                {
                    return pageIndex;
                }
                return 0;
            }
            set { m_PageIndex = value; } 
        }

        public bool IsPageParameterSpecified
        {
            get { return !string.IsNullOrEmpty(Parameters[PageParameterName]); }
        }

        private string m_SortColumnName;
        public string SortColumnName 
        { 
            get
            {
                if (!string.IsNullOrEmpty(m_SortColumnName))
                {
                    return m_SortColumnName;
                }
                if (!string.IsNullOrEmpty(Parameters[SortParameterName]))
                {
                    return Parameters[SortParameterName];
                }
                return string.Empty;
            }
            set { m_SortColumnName = value; }
        }

        public bool IsSortParameterSpecified
        {
            get { return !string.IsNullOrEmpty(Parameters[SortParameterName]); }
        }

        private bool? m_SortAscending;
        public bool SortAscending 
        { 
            get
            {
                if (m_SortAscending.HasValue)
                {
                    return m_SortAscending.Value;
                }
                bool sortAscending;
                if (!string.IsNullOrEmpty(Parameters[SortAscendingParameterName]) && bool.TryParse(Parameters[SortAscendingParameterName], out sortAscending))
                {
                    return sortAscending;
                }
                return true;
            }
            set { m_SortAscending = value; }
        }

        public bool IsSortAscendingParameterSpecified
        {
            get { return !string.IsNullOrEmpty(Parameters[SortAscendingParameterName]); }
        }

        private IDictionary<string, string> m_FiltersByColumnName;
        public IDictionary<string, string> FiltersByColumnName 
        { 
            get
            {
                if (m_FiltersByColumnName != null)
                {
                    return m_FiltersByColumnName;
                }
                var filtersByColumnName = new Dictionary<string, string>();
                foreach (var column in Columns)
                {
                    string parameterName = GetFilterParameterName(column.ColumnName);
                    if (Parameters[parameterName] != null)
                    {
                        filtersByColumnName.Add(column.ColumnName, Parameters[parameterName]);
                    }
                }
                return filtersByColumnName;
            }
            set { m_FiltersByColumnName = value; } 
        }

        public string SortParameterName
        {
            get { return ParameterNamePrefix + "Sort"; }
        }

        public string SortAscendingParameterName
        {
            get { return ParameterNamePrefix + "SortAsc"; }
        }

        public string PageParameterName
        {
            get { return ParameterNamePrefix + "Page"; }
        }

        public string FilterParameterNamePrefix
        {
            get { return ParameterNamePrefix; }
        }

        public string FilterParameterNameSuffix
        {
            get { return "Filter"; }
        }

        public string GetSortUrl(string columnName)
        {
            bool sortAscending = true;
            if (columnName.Equals(SortColumnName, StringComparison.OrdinalIgnoreCase))
            {
                sortAscending = !SortAscending;
            }
            NameValueCollection additionalParameters = new NameValueCollection(2);
            additionalParameters[SortParameterName] = columnName;
            additionalParameters[SortAscendingParameterName] = sortAscending.ToString();
            NameValueCollection mergedParameters = Parameters.Merge(additionalParameters, true);
            return string.Format("{0}?{1}", Path, mergedParameters.ToQueryString());
        }

        public string GetPageUrl(int page)
        {
            NameValueCollection additionalParameters = new NameValueCollection(1);
            additionalParameters[PageParameterName] = page.ToString(CultureInfo.CurrentCulture);
            NameValueCollection mergedParameters = Parameters.Merge(additionalParameters, true);
            return string.Format("{0}?{1}", Path, mergedParameters.ToQueryString());
        }

        public string GetFilterParameterName(string columnName)
        {
            string parameterName = string.Format("{0}{1}{2}", FilterParameterNamePrefix, columnName, FilterParameterNameSuffix);
            return HttpUtility.UrlEncode(parameterName);
        }

        public string GetFilterUrl()
        {
            return Path;
        }

        public bool CanAnyColumnFilter
        {
            get { return Columns.Any(column => column.CanFilter); }
        }
    }

    public class DataTablesGridColumnModel<T> where T : class
    {
        public DataTablesGridColumnModel()
        {
            CanSort = true;
        }

        public bool CanSort { get; set; }
        public bool CanFilter { get; set; }
        public string ColumnName { get; set; }
        public string Header { get; set; }
        public Func<T, object> Evaluator { get; set; }
        public bool EncodeValue { get; set; }
        public string ValueFormat { get; set; }

        public bool IsSorted(DataTablesGridModel<T> model)
        {
            return ColumnName.Equals(model.SortColumnName, StringComparison.OrdinalIgnoreCase);
        }

        public object Evaluate(T row)
        {
            object value = Evaluator(row);
            if (!string.IsNullOrEmpty(ValueFormat))
            {
                value = string.Format(ValueFormat, value);
            }
            if (EncodeValue)
            {
                value = HttpUtility.HtmlEncode(value);
            }
            return value;
        }
    }

    public class DataTablesGridRenderer<T> where T : class
    {
        public void Render(DataTablesGridModel<T> model, 
            IEnumerable<T> dataSource, int filteredRowCount, int totalRowCount, 
            TextWriter output)
        {
            if (model.CanAnyColumnFilter)
            {
                output.Write("<form method='get' action='{0}'>", model.GetFilterUrl());
                if (model.IsSortParameterSpecified)
                {
                    output.Write("<input type='hidden' name='{0}' value='{1}'/>",
                        HttpUtility.HtmlEncode(model.SortParameterName), HttpUtility.HtmlEncode(model.SortColumnName));
                }
                if (model.IsSortAscendingParameterSpecified)
                {
                    output.Write("<input type='hidden' name='{0}' value='{1}'/>",
                        HttpUtility.HtmlEncode(model.SortAscendingParameterName), model.SortAscending);
                }
            }
            output.Write("<table cellspacing='0' cellpadding='0' border='0' class='display'>");
            output.Write("<thead><tr>");
            foreach (var column in model.Columns)
            {
                if (column.CanSort)
                {
                    string @class = column.IsSorted(model) ?
                        model.SortAscending ? "sorting_asc"
                        : "sorting_desc"
                        : "sorting";
                    output.Write("<th class='{0}'>", @class);
                    output.Write("<a href='{0}'>{1}</a>", model.GetSortUrl(column.ColumnName), HttpUtility.HtmlEncode(column.Header));
                }
                else
                {
                    output.Write("<th>");
                    output.Write(HttpUtility.HtmlEncode(column.Header));
                }
                output.Write("</th>");
            }
            output.Write("</tr></thead>");
            if (model.CanAnyColumnFilter)
            {
                output.Write("<tfoot><tr>");
                foreach (var column in model.Columns)
                {
                    output.Write("<th>");
                    if (column.CanFilter)
                    {
                        output.Write("<input type='text' name='{0}' value='{1}'/>",
                            model.GetFilterParameterName(column.ColumnName),
                            model.FiltersByColumnName.ContainsKey(column.ColumnName) ? 
                                HttpUtility.HtmlEncode(model.FiltersByColumnName[column.ColumnName]) : string.Empty
                            );   
                    }
                    output.Write("</th>");
                }
                output.Write("</tr></tfoot>");
            }
            output.Write("<tbody>");
            bool isEven = false;
            foreach (T row in dataSource)
            {
                string @class = isEven ? "even" : "odd";
                output.Write("<tr class='{0}'>", @class);
                foreach (var column in model.Columns)
                {
                    output.Write("<td>");
                    output.Write(column.Evaluate(row));
                    output.Write("</td>");
                }
                output.Write("</tr>");
                isEven = !isEven;
            }
            output.Write("</tbody>");
            output.Write("</table>");
            if (model.CanAnyColumnFilter)
            {
                // this hidden submit button enables functionality of the enter key without the use of javascript
                // in submitting this form when pressed with a filter text field having focus
                output.Write("<input type='submit' style='display: none;'/>");
                output.Write("</form>");
            }
        }

        public void RenderPager(DataTablesGridModel<T> model, 
            IEnumerable<T> dataSource, int filteredRowCount, int totalRowCount, 
            TextWriter output)
        {
            output.Write("<div class='dataTables_info'>");
            if (filteredRowCount < 1)
            {
                output.Write("No entries");
            }
            else
            {
                output.Write("Showing {0} to {1} of {2} entries",
                    Math.Min(model.PageIndex * model.RowsPerPage + 1, filteredRowCount),
                    Math.Min((model.PageIndex + 1) * model.RowsPerPage, filteredRowCount),
                    filteredRowCount);
            }
            if (filteredRowCount < totalRowCount)
            {
                output.Write(" (filtered from {0} total entries)", totalRowCount);
            }
            output.Write("</div>");

            output.Write("<div class='dataTables_paginate paging_two_button'>");
            if (model.PageIndex < 1)
            {
                output.Write("<div class='paginate_disabled_previous' title='Previous'></div>");
            }
            else
            {
                output.Write("<a href='{0}' class='paginate_enabled_previous' title='Previous'></a>", model.GetPageUrl(model.PageIndex - 1));
            }
            if ((model.PageIndex + 1) * model.RowsPerPage >= filteredRowCount)
            {
                output.Write("<div class='paginate_disabled_next' title='Next' title='Next'></div>");
            }
            else
            {
                output.Write("<a href='{0}' class='paginate_enabled_next' title='Next'></a>", model.GetPageUrl(model.PageIndex + 1));
            }
            output.Write("</div>");
        }
    }
}