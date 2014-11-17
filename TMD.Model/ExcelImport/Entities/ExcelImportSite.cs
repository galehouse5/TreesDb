using System;
using System.Collections.Generic;
using System.Linq;
using TMD.Model.ExcelImport.EntityTypes;
using TMD.Model.Sites;

namespace TMD.Model.ExcelImport.Entities
{
    public class ExcelImportSite : ExcelImportEntity
    {
        protected internal ExcelImportSite()
        { }

        public override ExcelImportEntityType EntityType
        {
            get { return ExcelImportEntityType.Site; }
        }

        public string SiteName
        {
            get { return (string)this[ExcelImportSiteType.SiteName]; }
        }

        public float? Latitude
        {
            get { return (float?)this[ExcelImportSiteType.Latitude]; }
        }

        public float? Longitude
        {
            get { return (float?)this[ExcelImportSiteType.Longitude]; }
        }

        public Coordinates Coordinates
        {
            get { return Latitude.HasValue && Longitude.HasValue ? Coordinates.Create(Latitude.Value, Longitude.Value) : Coordinates.Null(); }
        }

        public string Comments
        {
            get { return (string)this[ExcelImportSiteType.Comments]; }
        }

        public string ReportUrl
        {
            get { return (string)this[ExcelImportSiteType.ReportUrl]; }
        }

        public IEnumerable<DateTime> GetVisitDates(IEnumerable<ExcelImportEntity> entities)
        {
            return GetSubsites(entities).SelectMany(ss => ss.GetVisitDates(entities)).Distinct();
        }

        public IEnumerable<ExcelImportSubsite> GetSubsites(IEnumerable<ExcelImportEntity> entities)
        {
            return entities.OfType<ExcelImportSubsite>().Where(ss => string.Equals(SiteName, ss.SiteName, StringComparison.OrdinalIgnoreCase));
        }

        public Coordinates GetAverageSubsiteCoordinates(IEnumerable<ExcelImportEntity> entities)
        {
            return CoordinateBounds.Create(GetSubsites(entities).Select(ss => ss.Coordinates.Coalesce(ss.GetAverageTreeCoordinates(entities)))).Center;
        }

        public IEnumerable<string> GetVisitors(IEnumerable<ExcelImportEntity> entities, DateTime date)
        {
            return GetSubsites(entities).SelectMany(ss => ss.GetVisitors(entities, date)).Distinct();
        }

        public IEnumerable<SiteVisit> CreateSiteVisits(IEnumerable<ExcelImportEntity> entities)
        {
            foreach (DateTime date in GetVisitDates(entities))
                yield return new SiteVisit
                {
                    Visited = date,
                    Name = SiteName,
                    Coordinates = Coordinates,
                    CalculatedCoordinates = Coordinates.Coalesce(GetAverageSubsiteCoordinates(entities)),
                    Comments = Comments ?? string.Empty,
                    Visitors = GetVisitors(entities, date)
                        .Select(v => Name.Create(v))
                        .ToList(),
                    TripReportUrl = ReportUrl ?? string.Empty
                }.RecordCreation();
        }

        public override string ToString()
        {
            return string.Format("{0}: {1}", RowIndex, SiteName);
        }
    }
}
