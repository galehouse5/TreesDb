using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.Web.Mvc;
using TMD.Models;
using TMD.Model.Users;
using TMD.Model;
using System.Data;
using System.Web.UI;
using System.IO;
using TMD.Model.Trees;
using TMD.Model.Extensions;
using System.Text;

namespace TMD.Controllers
{
    public class ExcelActionResult : FileResult
    {
        private DataTable m_Data;

        public ExcelActionResult(DataTable data)
            : base("application/vnd.ms-excel")
        {
            m_Data = data;
        }

        protected override void WriteFile(HttpResponseBase response)
        {
            using (HtmlTextWriter html = new HtmlTextWriter(response.Output))
            {
                html.RenderBeginTag(HtmlTextWriterTag.Table);

                html.RenderBeginTag(HtmlTextWriterTag.Thead);
                html.RenderBeginTag(HtmlTextWriterTag.Tr);
                foreach (DataColumn column in m_Data.Columns)
                {
                    html.RenderBeginTag(HtmlTextWriterTag.Th);
                    html.WriteEncodedText(column.ColumnName);
                    html.RenderEndTag();
                }
                html.RenderEndTag();
                html.RenderEndTag();

                html.RenderBeginTag(HtmlTextWriterTag.Tbody);
                foreach (DataRow row in m_Data.Rows)
                {
                    html.RenderBeginTag(HtmlTextWriterTag.Tr);
                    for (int i = 0; i < row.ItemArray.Length; i++)
                    {
                        html.RenderBeginTag(HtmlTextWriterTag.Td);
                        html.WriteEncodedText(row.ItemArray[i].ToString());
                        html.RenderEndTag();
                    }
                    html.RenderEndTag();
                }
                html.RenderEndTag();

                html.RenderEndTag();
            }
        }
    }

    [CheckBrowserCompatibilityFilter]
    public partial class ExportController : ControllerBase
    {
        [AuthorizeUser(Roles = UserRoles.Export)]
        public virtual ActionResult Trees(int id)
        {
            var tree = Repositories.Trees.Get(id);
            if (tree == null) { return new NotFoundResult(); }
            DataTable export = ExportToDataTable(new List<Tree> { tree });
            return new ExcelActionResult(export)
            {
                FileDownloadName = string.Format("Tree-{0}({1}).xls", tree.Id, UserSession.Units.Describe())
            };
        }

        [AuthorizeUser(Roles = UserRoles.Export)]
        public virtual ActionResult Sites(int id)
        {
            var site = Repositories.Sites.Get(id);
            if (site == null) { return new NotFoundResult(); }
            DataTable export = ExportToDataTable(
                from subsite in site.Subsites
                from tree in subsite.Trees
                orderby subsite.Name, tree.CommonName, tree.ScientificName, tree.Height.Feet
                select tree);
            return new ExcelActionResult(export)
            {
                FileDownloadName = string.Format("Site-{0}-Trees({1}).xls", site.Id, UserSession.Units.Describe())
            };
        }

        [AuthorizeUser(Roles = UserRoles.Export)]
        public virtual ActionResult SitesSpecies(int id, string botanicalName)
        {
            var site = Repositories.Sites.Get(id);
            if (site == null) { return new NotFoundResult(); }
            DataTable export = ExportToDataTable(
                from subsite in site.Subsites
                from tree in subsite.Trees
                where tree.ScientificName.Equals(botanicalName, StringComparison.OrdinalIgnoreCase)
                orderby subsite.Name, tree.CommonName, tree.Height.Feet
                select tree);
            return new ExcelActionResult(export)
            {
                FileDownloadName = string.Format("Site-{0}-Species-{1}-Trees({2}).xls", site.Id, botanicalName, UserSession.Units.Describe())
            };
        }

        [AuthorizeUser(Roles = UserRoles.Export)]
        public virtual ActionResult States(int id)
        {
            var state = Repositories.Locations.GetState(id);
            if (state == null) { return new NotFoundResult(); }
            IList<Tree> stateTrees = Repositories.Trees.ListByState(id);
            DataTable export = ExportToDataTable(
                from tree in stateTrees
                orderby tree.Subsite.County, tree.Subsite.Name, tree.CommonName, tree.ScientificName, tree.Height.Feet
                select tree);
            return new ExcelActionResult(export)
            {
                FileDownloadName = string.Format("State-{0}-Trees({1}).xls", state.Code, UserSession.Units.Describe())
            };
        }

        [AuthorizeUser(Roles = UserRoles.Export)]
        public virtual ActionResult StatesSpecies(int id, string botanicalName)
        {
            var state = Repositories.Locations.GetState(id);
            if (state == null) { return new NotFoundResult(); }
            IList<Tree> stateTrees = Repositories.Trees.ListByState(id);
            DataTable export = ExportToDataTable(
                from tree in stateTrees
                where tree.ScientificName.Equals(botanicalName, StringComparison.OrdinalIgnoreCase)
                orderby tree.Subsite.County, tree.Subsite.Name, tree.CommonName, tree.Height.Feet
                select tree);
            return new ExcelActionResult(export)
            {
                FileDownloadName = string.Format("State-{0}-Species-{1}-Trees({2}).xls", state.Code, botanicalName, UserSession.Units.Describe())
            };
        }

        [AuthorizeUser(Roles = UserRoles.Export)]
        public virtual ActionResult Species(string botanicalName, string commonName)
        {
            IList<Tree> speciesTrees = Repositories.Trees.ListByName(botanicalName, commonName);
            DataTable export = ExportToDataTable(
                from tree in speciesTrees
                orderby tree.Subsite.State.Code, tree.Subsite.County, tree.Subsite.Name, tree.Height.Feet
                select tree);
            return new ExcelActionResult(export)
            {
                FileDownloadName = string.Format("Species-{0}-Trees({1}).xls", botanicalName, UserSession.Units.Describe())
            };
        }

        [AuthorizeUser(Roles = UserRoles.Export)]
        public virtual ActionResult SpeciesByFilters(string botanicalNameFilter, string commonNameFilter)
        {
            IList<Tree> speciesTrees = Repositories.Trees.ListByNameFilters(botanicalNameFilter, commonNameFilter);
            DataTable export = ExportToDataTable(
                from tree in speciesTrees
                orderby tree.Subsite.State.Code, tree.Subsite.County, tree.Subsite.Name, tree.ScientificName, tree.Height.Feet
                select tree);
            StringBuilder filename = new StringBuilder();
            if (!string.IsNullOrEmpty(botanicalNameFilter))
            {
                filename.Append("BotanicalNames");
                filename.Append('~');
                filename.Append(botanicalNameFilter);
                filename.Append('-');
            }
            if (!string.IsNullOrEmpty(commonNameFilter))
            {
                filename.Append("CommonNames");
                filename.Append('~');
                filename.Append(commonNameFilter);
                filename.Append('-');
            }
            if (filename.Length == 0)
            {
                filename.Append("All");
                filename.Append('-');
            }
            filename.AppendFormat("Trees({0}).xls", UserSession.Units.Describe());
            return new ExcelActionResult(export)
            {
                FileDownloadName = filename.ToString()
            };
        }

        [AuthorizeUser(Roles = UserRoles.Export)]
        public virtual ActionResult LocationsByFilters(string stateFilter, string siteFilter, string subsiteFilter)
        {
            IList<Tree> locationTrees = Repositories.Trees.ListByStateSiteAndSubsiteFilters(stateFilter, siteFilter, subsiteFilter);
            DataTable export = ExportToDataTable(
                from tree in locationTrees
                orderby tree.Subsite.State.Code, tree.Subsite.County, tree.Subsite.Name, tree.ScientificName, tree.Height.Feet
                select tree);
            StringBuilder filename = new StringBuilder();
            if (!string.IsNullOrEmpty(stateFilter))
            {
                filename.Append("States");
                filename.Append('~');
                filename.Append(stateFilter);
                filename.Append('-');
            }
            if (!string.IsNullOrEmpty(siteFilter))
            {
                filename.Append("Sites");
                filename.Append('~');
                filename.Append(siteFilter);
                filename.Append('-');
            }
            if (!string.IsNullOrEmpty(subsiteFilter))
            {
                filename.Append("Subsites");
                filename.Append('~');
                filename.Append(subsiteFilter);
                filename.Append('-');
            }
            if (filename.Length == 0)
            {
                filename.Append("All");
                filename.Append('-');
            }
            filename.AppendFormat("Trees({0}).xls", UserSession.Units.Describe());
            return new ExcelActionResult(export)
            {
                FileDownloadName = filename.ToString()
            };
        }

        private DataTable ExportToDataTable(IEnumerable<Tree> trees)
        {
            DataTable table = new DataTable();
            table.Columns.Add("Common Name");
            table.Columns.Add("Botanical Name");
            table.Columns.Add("State");
            table.Columns.Add("County");
            table.Columns.Add("Site");
            table.Columns.Add("Subsite");
            table.Columns.Add("Subsite Latitude");
            table.Columns.Add("Subsite Longitude");
            table.Columns.Add("Location comments");
            table.Columns.Add("Tree name");
            table.Columns.Add("Tree id");
            table.Columns.Add("Measurement number");
            table.Columns.Add("Latitude");
            table.Columns.Add("Longitude");
            table.Columns.Add("Elevation");
            table.Columns.Add("Ownership type");
            switch (UserSession.Units)
            {
                case Units.Default:
                case Units.Feet:
                    table.Columns.Add("Height (ft)");
                    break;
                case Units.Meters:
                    table.Columns.Add("Height (m)");
                    break;
                case Units.Yards:
                    table.Columns.Add("Height (yd)");
                    break;
                default:
                    throw new NotImplementedException();
            }
            table.Columns.Add("Height measurement method");

            switch (UserSession.Units)
            {
                case Units.Default:
                case Units.Feet:
                    table.Columns.Add("Girth (ft)");
                    table.Columns.Add("Girth (in)");
                    table.Columns.Add("Crown spread (ft)");
                    break;
                case Units.Meters:
                    table.Columns.Add("Girth (m)");
                    table.Columns.Add("Girth (cm)");
                    table.Columns.Add("Crown spread (m)");
                    break;
                case Units.Yards:
                    table.Columns.Add("Girth (yd)");
                    table.Columns.Add("Girth (in)");
                    table.Columns.Add("Crown spread (yd)");
                    break;
                default:
                    throw new NotImplementedException();
            }            
            table.Columns.Add("Tree comments");
            table.Columns.Add("Measurer(s)");
            table.Columns.Add("Measured");
            table.Columns.Add("Trip report url");
            table.Columns.Add("Photos available");
            foreach (Tree tree in trees)
            {
                table.Rows.Add(
                    tree.CommonName,
                    tree.ScientificName,
                    tree.Subsite.State,
                    tree.Subsite.County,
                    tree.Subsite.Site.Name,
                    tree.Subsite.Site.ContainsSingleSubsite ? string.Empty : tree.Subsite.Name,
                    tree.Subsite.Coordinates.Latitude.ToString(CoordinatesFormat.DegreesDecimalMinutes),
                    tree.Subsite.Coordinates.Longitude.ToString(CoordinatesFormat.DegreesDecimalMinutes),
                    string.IsNullOrEmpty(tree.Subsite.LastVisit.Comments) ? tree.Subsite.Site.LastVisit.Comments : tree.Subsite.Site.LastVisit.Comments,
                    string.Empty,
                    tree.Id,
                    tree.MeasurementCount,
                    tree.Coordinates.Latitude.ToString(CoordinatesFormat.DegreesDecimalMinutes),
                    tree.Coordinates.Longitude.ToString(CoordinatesFormat.DegreesDecimalMinutes),
                    tree.Elevation.ToString(ElevationFormat.DecimalFeet),
                    tree.Subsite.OwnershipType,
                    tree.Height.ToString(UserSession.Units),
                    tree.HeightMeasurementMethod.Describe(),
                    tree.Girth.ToString(UserSession.Units, renderMode: UnitRenderMode.PrefixOnly),
                    tree.Girth.ToString(UserSession.Units, renderMode: UnitRenderMode.SubprefixOnly),
                    tree.CrownSpread.ToString(UserSession.Units),
                    tree.LastMeasurement.GeneralComments,
                    string.Join(", ", tree.Measurers.Select(m => m.ToString())),
                    tree.LastMeasured.ToString("yyyy-MM-dd"),
                    HttpUtility.UrlEncode(tree.Subsite.Site.LastVisit.TripReportUrl),
                    tree.Photos.Count > 0 ? "Y" : "N");
            }
            return table;
        }
    }
}
