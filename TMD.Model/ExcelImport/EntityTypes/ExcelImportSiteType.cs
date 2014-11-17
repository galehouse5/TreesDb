using System.Collections.Generic;
using TMD.Model.Excel;
using TMD.Model.ExcelImport.Attributes;
using TMD.Model.ExcelImport.Attributes.Validation;
using TMD.Model.ExcelImport.Entities;
using TMD.Model.Users;

namespace TMD.Model.ExcelImport.EntityTypes
{
    public class ExcelImportSiteType : ExcelImportEntityType
    {
        public static readonly ExcelImportAttribute SiteName = new ExcelImportUniquenessValidator(
            new ExcelImportStringAttribute(1, "Site Name") { IsRequired = true });
        public static readonly ExcelImportAttribute Latitude = new ExcelImportFloatAttribute(2, "Latitude") { ValueFormat = "{0:#.00000}", MinInclusive = -90f, MaxInclusive = 90f };
        public static readonly ExcelImportAttribute Longitude = new ExcelImportFloatAttribute(3, "Longitude") { ValueFormat = "{0:#.00000}", MinInclusive = -180f, MaxInclusive = 180f };
        public static readonly ExcelImportAttribute MeasurerContact = new ExcelImportStringAttribute(4, "Measurer Contact");
        public static readonly ExcelImportAttribute PublicizeContact = new ExcelImportBooleanAttribute(5, "Publicize Contact");
        public static readonly ExcelImportAttribute Comments = new ExcelImportStringAttribute(6, "Comments") { MaxLength = 500 };
        public static readonly ExcelImportAttribute ReportUrl = new ExcelImportStringAttribute(7, "Report Url") { MaxLength = 500 };

        public ExcelImportSiteType(byte id)
            : base(id)
        { }

        public override string Name
        {
            get { return "Site"; }
        }

        public override string Worksheet
        {
            get { return "Sites"; }
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
                yield return Latitude;
                yield return Longitude;
                yield return MeasurerContact;
                yield return PublicizeContact;
                yield return Comments;
                yield return ReportUrl;
            }
        }

        public override ExcelImportEntity CreateEntity(IExcelWorksheet worksheet, int row, User user)
        {
            ExcelImportEntity entity = new ExcelImportSite
            {
                Row = row,
                User = user
            };
            entity.Values = CreateValues(entity, worksheet);
            return entity;
        }
    }
}
