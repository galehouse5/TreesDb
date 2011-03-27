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
            var tree = Repositories.Trees.FindById(id);
            DataTable export = ExportToDataTable(new List<Tree> { tree });
            return new ExcelActionResult(export)
            {
                FileDownloadName = string.Format("Tree-{0}.xls", tree.Id)
            };
        }

        [AuthorizeUser(Roles = UserRoles.Export)]
        public virtual ActionResult Sites(int id)
        {
            var site = Repositories.Sites.FindById(id);
            DataTable export = ExportToDataTable(
                from subsite in site.Subsites
                from tree in subsite.Trees
                orderby subsite.Name, tree.CommonName, tree.ScientificName, tree.Height.Feet
                select tree);
            return new ExcelActionResult(export)
            {
                FileDownloadName = string.Format("Site-{0}-Trees.xls", site.Id)
            };
        }

        [AuthorizeUser(Roles = UserRoles.Export)]
        public virtual ActionResult SitesSpecies(int id, string botanicalName)
        {
            var site = Repositories.Sites.FindById(id);
            DataTable export = ExportToDataTable(
                from subsite in site.Subsites
                from tree in subsite.Trees
                where tree.ScientificName.Equals(botanicalName, StringComparison.OrdinalIgnoreCase)
                orderby subsite.Name, tree.CommonName, tree.Height.Feet
                select tree);
            return new ExcelActionResult(export)
            {
                FileDownloadName = string.Format("Site-{0}-Species-{1}-Trees.xls", site.Id, botanicalName)
            };
        }

        [AuthorizeUser(Roles = UserRoles.Export)]
        public virtual ActionResult States(int id)
        {
            var state = Repositories.Locations.FindStateById(id);
            IList<Tree> stateTrees = Repositories.Trees.ListByState(id);
            DataTable export = ExportToDataTable(
                from tree in stateTrees
                orderby tree.Subsite.County, tree.Subsite.Name, tree.CommonName, tree.ScientificName, tree.Height.Feet
                select tree);
            return new ExcelActionResult(export)
            {
                FileDownloadName = string.Format("State-{0}-Trees.xls", state.Code)
            };
        }

        [AuthorizeUser(Roles = UserRoles.Export)]
        public virtual ActionResult StatesSpecies(int id, string botanicalName)
        {
            var state = Repositories.Locations.FindStateById(id);
            IList<Tree> stateTrees = Repositories.Trees.ListByState(id);
            DataTable export = ExportToDataTable(
                from tree in stateTrees
                where tree.ScientificName.Equals(botanicalName, StringComparison.OrdinalIgnoreCase)
                orderby tree.Subsite.County, tree.Subsite.Name, tree.CommonName, tree.Height.Feet
                select tree);
            return new ExcelActionResult(export)
            {
                FileDownloadName = string.Format("State-{0}-Species-{1}-Trees.xls", state.Code, botanicalName)
            };
        }

        [AuthorizeUser(Roles = UserRoles.Export)]
        public virtual ActionResult Species(string botanicalName)
        {
            IList<Tree> speciesTrees = Repositories.Trees.ListByBotanicalName(botanicalName);
            DataTable export = ExportToDataTable(
                from tree in speciesTrees
                orderby tree.Subsite.State.Code, tree.Subsite.County, tree.Subsite.Name, tree.Height.Feet
                select tree);
            return new ExcelActionResult(export)
            {
                FileDownloadName = string.Format("Species-{0}-Trees.xls", botanicalName)
            };
        }

        [AuthorizeUser(Roles = UserRoles.Export)]
        public virtual ActionResult SpeciesByFilters(string botanicalNameFilter, string commonNameFilter)
        {
            IList<Tree> speciesTrees = Repositories.Trees.ListByBotanicalNameAndCommonNameFilters(botanicalNameFilter, commonNameFilter);
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
            filename.Append("Trees.xls");
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
            filename.Append("Trees.xls");
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
            table.Columns.Add("State or province");
            table.Columns.Add("County or township");
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
            table.Columns.Add("Height (ft)");
            table.Columns.Add("Height measurement method");
            table.Columns.Add("Girth (ft)");
            table.Columns.Add("Girth (in)");
            table.Columns.Add("Crown spread (ft)");
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
                    tree.Height.ToString(DistanceFormat.DecimalFeet),
                    tree.HeightMeasurementMethod.Describe(),
                    tree.Girth.ToString(DistanceFormat.DecimalFeet),
                    tree.Girth.ToString(DistanceFormat.DecimalInches),
                    tree.CrownSpread.ToString(DistanceFormat.DecimalFeet),
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
