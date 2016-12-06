using System.Collections.Generic;
using System.Linq;
using System.Net;
using System.Text;
using TMD.Model.Extensions;
using TMD.Model.Trees;

namespace TMD.Model.Exports
{
    public class TreeCsvExporter : ICsvExporter<Tree>
    {
        public IDictionary<string, string> Identifiers { get; private set; } = new Dictionary<string, string>(0);

        public string Filename
        {
            get
            {
                StringBuilder filename = new StringBuilder();

                foreach (var identifier in Identifiers
                    .Where(i => !string.IsNullOrEmpty(i.Value)))
                {
                    filename.Append($"{identifier.Key}-{identifier.Value} ");
                }

                if (filename.Length == 0)
                {
                    filename.Append("All ");
                }

                filename.Append($"Trees ({UserSession.Units.Describe()}).csv");

                return filename.ToString();
            }
        }

        public IEnumerable<string> Headers
        {
            get
            {
                yield return "Common Name";
                yield return "Botanical Name";
                yield return "State";
                yield return "County";
                yield return "Site";
                yield return "Subsite";
                yield return "Subsite Latitude";
                yield return "Subsite Longitude";
                yield return "Location comments";
                yield return "Tree name";
                yield return "Tree id";
                yield return "Measurement number";
                yield return "Latitude";
                yield return "Longitude";
                yield return "Elevation";
                yield return "Ownership type";
                yield return $"Height ({(UserSession.Units.Abbreviation())})";
                yield return "Height measurement method";
                yield return $"Girth ({(UserSession.Units.Abbreviation())})";
                yield return $"Girth ({(UserSession.Units.SubAbbreviation())})";
                yield return $"Crown spread ({(UserSession.Units.Abbreviation())})";
                yield return "Tree comments";
                yield return "Measurer(s)";
                yield return "Measured";
                yield return "Trip report url";
                yield return "Photos available";
            }
        }

        public IEnumerable<string> GetRow(Tree entity)
        {
            yield return entity.CommonName;
            yield return entity.ScientificName;
            yield return entity.Subsite.State.Name;
            yield return entity.Subsite.County;
            yield return entity.Subsite.Site.Name;
            yield return entity.Subsite.Site.ContainsSingleSubsite ? null : entity.Subsite.Name;
            yield return entity.Subsite.Coordinates.Latitude.ToString(CoordinatesFormat.DegreesDecimalMinutes);
            yield return entity.Subsite.Coordinates.Longitude.ToString(CoordinatesFormat.DegreesDecimalMinutes);
            yield return string.IsNullOrEmpty(entity.Subsite.LastVisit.Comments) ? entity.Subsite.Site.LastVisit.Comments : entity.Subsite.Site.LastVisit.Comments;
            yield return null;
            yield return entity.Id.ToString();
            yield return entity.MeasurementCount.ToString();
            yield return entity.Coordinates.Latitude.ToString(CoordinatesFormat.DegreesDecimalMinutes);
            yield return entity.Coordinates.Longitude.ToString(CoordinatesFormat.DegreesDecimalMinutes);
            yield return entity.Elevation.ToString(ElevationFormat.DecimalFeet);
            yield return entity.Subsite.OwnershipType;
            yield return entity.Height.ToString(UserSession.Units);
            yield return entity.HeightMeasurementMethod.Describe();
            yield return entity.Girth.ToString(UserSession.Units, renderMode: UnitRenderMode.PrefixOnly);
            yield return entity.Girth.ToString(UserSession.Units, renderMode: UnitRenderMode.SubprefixOnly);
            yield return entity.CrownSpread.ToString(UserSession.Units);
            yield return entity.LastMeasurement.GeneralComments;
            yield return string.Join(", ", entity.Measurers.Select(m => m.ToString()));
            yield return entity.LastMeasured.ToString("yyyy-MM-dd");
            yield return WebUtility.UrlEncode(entity.Subsite.Site.LastVisit.TripReportUrl);
            yield return entity.Photos.Count > 0 ? "Y" : "N";
        }
    }
}
