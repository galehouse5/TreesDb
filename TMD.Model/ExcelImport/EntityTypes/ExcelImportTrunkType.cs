using System.Collections.Generic;
using TMD.Model.Excel;
using TMD.Model.ExcelImport.Attributes;
using TMD.Model.ExcelImport.Attributes.Validation;
using TMD.Model.ExcelImport.Entities;
using TMD.Model.Users;

namespace TMD.Model.ExcelImport.EntityTypes
{
    public class ExcelImportTrunkType : ExcelImportEntityType
    {
        public static readonly ExcelImportAttribute TreeName = new ExcelImportForeignKeyValidator(
            innerAttribute: new ExcelImportStringAttribute(1, "Tree Name") { IsRequired = true },
            parentEntityType: ExcelImportEntityType.Tree,
            parentAttribute: ExcelImportTreeType.TreeName);
        public static readonly ExcelImportAttribute Height = new ExcelImportFloatAttribute(2, "Height") { MinExclusive = 0f };
        public static readonly ExcelImportAttribute HeightDistanceTop = new ExcelImportFloatAttribute(3, "Height Distance Top") { MinExclusive = 0f };
        public static readonly ExcelImportAttribute HeightAngleTop = new ExcelImportFloatAttribute(4, "Height Angle Top") { MinInclusive = 0f, MaxExclusive = 90f };
        public static readonly ExcelImportAttribute HeightDistanceBottom = new ExcelImportFloatAttribute(5, "Height Distance Bottom") { MinExclusive = 0f };
        public static readonly ExcelImportAttribute HeightAngleBottom = new ExcelImportFloatAttribute(6, "Height Angle Bottom") { MinExclusive = -90f, MaxInclusive = 0f };
        public static readonly ExcelImportAttribute HeightVerticalOffset = new ExcelImportFloatAttribute(7, "Height Vertical Offset");
        public static readonly ExcelImportAttribute Girth = new ExcelImportFloatAttribute(8, "Girth") { MinExclusive = 0f };
        public static readonly ExcelImportAttribute GirthMeasurementHeight = new ExcelImportFloatAttribute(9, "Girth Measurement Height");
        public static readonly ExcelImportAttribute Comments = new ExcelImportStringAttribute(10, "Comments") { IsRequired = true, MaxLength = 500 };

        public ExcelImportTrunkType(byte id)
            : base(id)
        { }

        public override string Name
        {
            get { return "Trunk"; }
        }

        public override string Worksheet
        {
            get { return "Trunks"; }
        }

        public override int StartRow
        {
            get { return 4; }
        }

        public override IEnumerable<ExcelImportAttribute> Attributes
        {
            get
            {
                yield return TreeName;
                yield return Height;
                yield return HeightDistanceTop;
                yield return HeightAngleTop;
                yield return HeightDistanceBottom;
                yield return HeightAngleBottom;
                yield return HeightVerticalOffset;
                yield return Girth;
                yield return GirthMeasurementHeight;
                yield return Comments;
            }
        }

        public override ExcelImportEntity CreateEntity(IExcelWorksheet worksheet, int row, User user)
        {
            ExcelImportEntity entity = new ExcelImportTrunk
            {
                Row = row,
                User = user
            };
            entity.Values = CreateValues(entity, worksheet);
            return entity;
        }
    }
}
