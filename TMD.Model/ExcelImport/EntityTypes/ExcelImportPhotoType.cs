using System.Collections.Generic;
using TMD.Model.Excel;
using TMD.Model.ExcelImport.Attributes;
using TMD.Model.ExcelImport.Attributes.Validation;
using TMD.Model.ExcelImport.Entities;
using TMD.Model.Users;

namespace TMD.Model.ExcelImport.EntityTypes
{
    public class ExcelImportPhotoType : ExcelImportEntityType
    {
        public static readonly ExcelImportAttribute SiteName = new ExcelImportForeignKeyValidator(
            innerAttribute: new ExcelImportStringAttribute(1, "Site Name"),
            parentEntityType: ExcelImportEntityType.Site,
            parentAttribute: ExcelImportSiteType.SiteName);
        public static readonly ExcelImportAttribute SubsiteName = new ExcelImportForeignKeyValidator(
            innerAttribute: new ExcelImportStringAttribute(2, "Subsite Name"),
            parentEntityType: ExcelImportEntityType.Subsite,
            parentAttribute: ExcelImportSubsiteType.SubsiteName);
        public static readonly ExcelImportAttribute TreeName = new ExcelImportForeignKeyValidator(
            innerAttribute: new ExcelImportStringAttribute(3, "Tree Name"),
            parentEntityType: ExcelImportEntityType.Tree,
            parentAttribute: ExcelImportTreeType.TreeName);
        public static readonly ExcelImportAttribute Filename = new ExcelImportUniquenessValidator(
            new ExcelImportFileExtensionValidator(
                innerAttribute: new ExcelImportStringAttribute(4, "Filename") { IsRequired = true, MaxLength = 500 },
                extensions: new string[] { "jpeg", "jpg", "gif", "png" }));
        public static readonly ExcelImportAttribute Photographer = new ExcelImportStringAttribute(5, "Photographer");
        public static readonly ExcelImportAttribute Caption = new ExcelImportStringAttribute(6, "Caption") { MaxLength = 500 };

        public ExcelImportPhotoType(byte id)
            : base(id)
        { }

        public override string Name
        {
            get { return "Photo"; }
        }

        public override string Worksheet
        {
            get { return "Photos"; }
        }

        public override int StartRow
        {
            get { return 4; }
        }

        public override IEnumerable<ExcelImportAttribute> Attributes
        {
            get
            {
                yield return SiteName;
                yield return SubsiteName;
                yield return TreeName;
                yield return Filename;
                yield return Photographer;
                yield return Caption;
            }
        }

        public override ExcelImportEntity CreateEntity(IExcelWorksheet worksheet, int row, User user)
        {
            ExcelImportEntity entity = new ExcelImportPhoto
            {
                Row = row,
                User = user
            };
            entity.Values = CreateValues(entity, worksheet);
            return entity;
        }
    }
}
