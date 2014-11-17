using System.Collections.Generic;
using TMD.Model.Excel;
using TMD.Model.ExcelImport.Attributes;
using TMD.Model.ExcelImport.Attributes.Validation;
using TMD.Model.ExcelImport.Entities;
using TMD.Model.Users;

namespace TMD.Model.ExcelImport.EntityTypes
{
    public class ExcelImportSubsiteType : ExcelImportEntityType
    {
        public static readonly ExcelImportAttribute SiteName = new ExcelImportForeignKeyValidator(
            innerAttribute: new ExcelImportStringAttribute(1, "Site Name") { IsRequired = true },
            parentEntityType: ExcelImportEntityType.Site,
            parentAttribute: ExcelImportSiteType.SiteName);
        public static readonly ExcelImportAttribute SubsiteName = new ExcelImportUniquenessValidator(
            new ExcelImportStringAttribute(2, "Subsite Name") { IsRequired = true });
        public static readonly ExcelImportAttribute State = new ExcelImportEnumAttribute<ExcelImportState>(3, "State") { IsRequired = true };
        public static readonly ExcelImportAttribute County = new ExcelImportStringAttribute(4, "County") { IsRequired = true };
        public static readonly ExcelImportAttribute Township = new ExcelImportStringAttribute(5, "Township");
        public static readonly ExcelImportAttribute Latitude = new ExcelImportFloatAttribute(6, "Latitude") { ValueFormat = "{0:#.00000}", MinInclusive = -90f, MaxInclusive = 90f };
        public static readonly ExcelImportAttribute Longitude = new ExcelImportFloatAttribute(7, "Longitude") { ValueFormat = "{0:#.00000}", MinInclusive = -180f, MaxInclusive = 180f };
        public static readonly ExcelImportAttribute Comments = new ExcelImportStringAttribute(8, "Comments") { MaxLength = 500 };
        public static readonly ExcelImportAttribute OwnershipType = new ExcelImportStringAttribute(9, "Ownership Type");
        public static readonly ExcelImportAttribute OwnershipContact = new ExcelImportStringAttribute(10, "Ownership Contact") { MaxLength = 500 };
        public static readonly ExcelImportAttribute PublicizeContact = new ExcelImportBooleanAttribute(11, "Publicize Contact");

        public ExcelImportSubsiteType(byte id)
            : base(id)
        { }

        public override string Name
        {
            get { return "Subsite"; }
        }

        public override string Worksheet
        {
            get { return "Subsites"; }
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
                yield return State;
                yield return County;
                yield return Township;
                yield return Latitude;
                yield return Longitude;
                yield return Comments;
                yield return OwnershipType;
                yield return OwnershipContact;
                yield return PublicizeContact;
            }
        }

        public override ExcelImportEntity CreateEntity(IExcelWorksheet worksheet, int row, User user)
        {
            ExcelImportEntity entity = new ExcelImportSubsite
            {
                Row = row,
                User = user
            };
            entity.Values = CreateValues(entity, worksheet);
            return entity;
        }
    }
}
