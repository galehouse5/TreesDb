using System.Collections.Generic;
using System.Linq;
using TMD.Model.ExcelImport.EntityTypes;
using TMD.Model.Photo;
using TMD.Model.Sites;
using TMD.Model.Trees;

namespace TMD.Model.ExcelImport.Entities
{
    public class ExcelImportPhoto : ExcelImportEntity
    {
        protected internal ExcelImportPhoto()
        { }

        public override ExcelImportEntityType EntityType
        {
            get { return ExcelImportEntityType.Photo; }
        }

        public string SiteName
        {
            get { return (string)this[ExcelImportPhotoType.SiteName]; }
        }

        public string SubsiteName
        {
            get { return (string)this[ExcelImportPhotoType.SubsiteName]; }
        }

        public string TreeName
        {
            get { return (string)this[ExcelImportPhotoType.TreeName]; }
        }

        public string Filename
        {
            get { return (string)this[ExcelImportPhotoType.Filename]; }
        }

        public PhotoReference CreatePhotoReference(IEnumerable<PhotoFile> files, SubsiteVisit visit)
        {
            PhotoFile file = files.Single(f => f.Filename.Equals(Filename));
            return new SubsiteVisitPhotoReference(file, visit);
        }

        public PhotoReference CreatePhotoReference(IEnumerable<PhotoFile> files, Measurement measurement)
        {
            PhotoFile file = files.Single(f => f.Filename.Equals(Filename));
            return new TreeMeasurementPhotoReference(file, measurement);
        }

        public override string ToString()
        {
            return string.Format("{0}: {1}", RowIndex, Filename);
        }
    }
}
