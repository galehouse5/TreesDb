using System;
using System.Collections.Generic;
using System.Linq;
using TMD.Model.ExcelImport.EntityTypes;
using TMD.Model.Locations;
using TMD.Model.Photo;
using TMD.Model.Sites;

namespace TMD.Model.ExcelImport.Entities
{
    public class ExcelImportSubsite : ExcelImportEntity
    {
        protected internal ExcelImportSubsite()
        { }

        public override ExcelImportEntityType EntityType
        {
            get { return ExcelImportEntityType.Subsite; }
        }

        public string SiteName
        {
            get { return (string)this[ExcelImportSubsiteType.SiteName]; }
        }

        public string SubsiteName
        {
            get { return (string)this[ExcelImportSubsiteType.SubsiteName]; }
        }

        public float? Latitude
        {
            get { return (float?)this[ExcelImportSubsiteType.Latitude]; }
        }

        public float? Longitude
        {
            get { return (float?)this[ExcelImportSubsiteType.Longitude]; }
        }

        public Coordinates Coordinates
        {
            get { return Latitude.HasValue && Longitude.HasValue ? Coordinates.Create(Latitude.Value, Longitude.Value) : Coordinates.Null(); }
        }

        public ExcelImportState State
        {
            get { return (ExcelImportState)this[ExcelImportSubsiteType.State]; }
        }

        public string County
        {
            get { return (string)this[ExcelImportSubsiteType.County]; }
        }

        public string OwnershipType
        {
            get { return (string)this[ExcelImportSubsiteType.OwnershipType]; }
        }

        public string OwnershipContact
        {
            get { return (string)this[ExcelImportSubsiteType.OwnershipContact]; }
        }

        public bool? PublicizeContact
        {
            get { return (bool?)this[ExcelImportSubsiteType.PublicizeContact]; }
        }

        public string Comments
        {
            get { return (string)this[ExcelImportSubsiteType.Comments]; }
        }

        public IEnumerable<DateTime> GetVisitDates(IEnumerable<ExcelImportEntity> entities)
        {
            return GetTrees(entities).Select(t => t.Date).Distinct();
        }

        public IEnumerable<ExcelImportTree> GetTrees(IEnumerable<ExcelImportEntity> entities)
        {
            return entities.OfType<ExcelImportTree>().Where(t => string.Equals(SubsiteName, t.SubsiteName, StringComparison.OrdinalIgnoreCase));
        }

        public IEnumerable<ExcelImportTree> GetTrees(IEnumerable<ExcelImportEntity> entities, DateTime measurementDate)
        {
            return GetTrees(entities).Where(t => measurementDate.Equals(t.Date));
        }

        public Coordinates GetAverageTreeCoordinates(IEnumerable<ExcelImportEntity> entities)
        {
            return CoordinateBounds.Create(GetTrees(entities).Select(t => t.Coordinates)).Center;
        }

        public IEnumerable<string> GetVisitors(IEnumerable<ExcelImportEntity> entities, DateTime date)
        {
            return GetTrees(entities, date).SelectMany(t => t.Measurers).Distinct();
        }

        public IEnumerable<SubsiteVisit> CreateSubsiteVisits(IEnumerable<ExcelImportEntity> entities, IEnumerable<State> states, IEnumerable<PhotoFile> photoFiles)
        {
            foreach (DateTime date in GetVisitDates(entities))
            {
                SubsiteVisit visit = new SubsiteVisit
                {
                    Visited = date,
                    Name = SubsiteName,
                    State = states.SingleOrDefault(s => s.IsMatch(State.ToString())),
                    County = County,
                    OwnershipType = OwnershipType ?? string.Empty,
                    Coordinates = Coordinates,
                    CalculatedCoordinates = Coordinates.Coalesce(GetAverageTreeCoordinates(entities)),
                    OwnershipContactInfo = OwnershipContact ?? string.Empty,
                    MakeOwnershipContactInfoPublic = true.Equals(PublicizeContact),
                    Comments = Comments ?? string.Empty,
                    Visitors = GetVisitors(entities, date)
                        .Select(v => Name.Create(v))
                        .ToList()
                }.RecordCreation();

                visit.Photos = (from photo in entities.OfType<ExcelImportPhoto>()
                                where string.Equals(photo.SubsiteName, SubsiteName)
                                select photo.CreatePhotoReference(photoFiles, visit))
                                .ToList();

                yield return visit;
            }
        }

        public override string ToString()
        {
            return string.Format("{0} ({1})", RowIndex, SubsiteName);
        }
    }
}
