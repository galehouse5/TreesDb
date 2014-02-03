using FluentMigrator;
using System;
using TMD.Model.ExcelImport;

namespace Tmd.Migrations.Y2014
{
    [Migration(1)]
    public class M1_CreateExcelImportSchema : AutoReversingMigration
    {
        public override void Up()
        {
            Create.Table("ExcelImport_EntityTypes")
                .WithColumn("ID").AsInt32().PrimaryKey()
                .WithColumn("Name").AsAnsiString(50)
                .WithColumn("Spreadsheet").AsAnsiString(50)
                .WithColumn("StartRow").AsInt32();

            Create.Table("ExcelImport_Entities")
                .WithColumn("ID").AsInt32().PrimaryKey().Identity()
                .WithColumn("EntityTypeID").AsInt32().ForeignKey("ExcelImport_EntityTypes", "ID")
                .WithColumn("UserID").AsInt32().ForeignKey("FK_ExcelImport_Entities_UserID_Users.Users_Id", "Users", "Users", "Id")
                .WithColumn("RowIndex").AsInt32();
            
            Create.Table("ExcelImport_Attributes")
                .WithColumn("ID").AsInt32().PrimaryKey().Identity()
                .WithColumn("Type").AsByte()
                .WithColumn("EntityTypeID").AsInt32().ForeignKey("ExcelImport_EntityTypes", "ID")
                .WithColumn("Name").AsAnsiString(50)
                .WithColumn("Column").AsInt32()
                .WithColumn("IsRequired").AsBoolean()
                .WithColumn("ValueFormat").AsAnsiString(50).Nullable()
                .WithColumn("EnumerationType").AsAnsiString(500).Nullable()
                .WithColumn("MinFloatInclusive").AsFloat().Nullable()
                .WithColumn("MaxFloatInclusive").AsFloat().Nullable()
                .WithColumn("MinFloatExclusive").AsFloat().Nullable()
                .WithColumn("MaxFloatExclusive").AsFloat().Nullable()
                .WithColumn("MinIntegerInclusive").AsInt32().Nullable()
                .WithColumn("MaxIntegerInclusive").AsInt32().Nullable()
                .WithColumn("MaxStringLength").AsInt32().Nullable();

            Create.Table("ExcelImport_Values")
                .WithColumn("ID").AsInt32().PrimaryKey().Identity()
                .WithColumn("Type").AsByte()
                .WithColumn("EntityID").AsInt32().ForeignKey("ExcelImport_Entities", "ID")
                .WithColumn("AttributeID").AsInt32().ForeignKey("ExcelImport_Attributes", "ID")
                .WithColumn("BooleanValue").AsBoolean().Nullable()
                .WithColumn("DateValue").AsDate().Nullable()
                .WithColumn("ByteValue").AsByte().Nullable()
                .WithColumn("FloatValue").AsFloat().Nullable()
                .WithColumn("IntegerValue").AsInt32().Nullable()
                .WithColumn("StringValue").AsString(500).Nullable();

            InsertSiteDefinition();
            InsertSubsiteDefinition();
            InsertTreeDefinition();
            InsertTrunkDefinition();
        }

        public void InsertEntityType(int id, string name, string spreadsheet, int startRow)
        {
            Insert.IntoTable("ExcelImport_EntityTypes")
                .Row(new { ID = id, Name = name, Spreadsheet = spreadsheet, StartRow = startRow });
        }

        public void InsertFloatAttribute(int entityType, int column, string name, string valueFormat = null, bool isRequired = false, float? minInclusive = null, float? maxInclusive = null, float? minExclusive = null, float? maxExclusive = null)
        {
            Insert.IntoTable("ExcelImport_Attributes")
                .Row(new { Type = 1, EntityTypeID = entityType, Name = name, Column = column, ValueFormat = valueFormat, IsRequired = isRequired, MinFloatInclusive = minInclusive, MaxFloatInclusive = maxInclusive, MinFloatExclusive = minExclusive, MaxFloatExclusive = maxExclusive });
        }

        public void InsertIntegerAttribute(int entityType, int column, string name, string valueFormat = null, bool isRequired = false, int? minInclusive = null, int? maxInclusive = null)
        {
            Insert.IntoTable("ExcelImport_Attributes")
                .Row(new { Type = 2, EntityTypeID = entityType, Name = name, Column = column, ValueFormat = valueFormat, IsRequired = isRequired, MinIntegerInclusive = minInclusive, MaxIntegerInclusive = maxInclusive });
        }

        public void InsertStringAttribute(int entityType, int column, string name, int maxLength, string valueFormat = null, bool isRequired = false)
        {
            Insert.IntoTable("ExcelImport_Attributes")
                .Row(new { Type = 3, EntityTypeID = entityType, Name = name, Column = column, ValueFormat = valueFormat, IsRequired = isRequired, MaxStringLength = maxLength });
        }

        public void InsertBooleanAttribute(int entityType, int column, string name, string valueFormat = null, bool isRequired = false)
        {
            Insert.IntoTable("ExcelImport_Attributes")
                .Row(new { Type = 4, EntityTypeID = entityType, Name = name, Column = column, ValueFormat = valueFormat, IsRequired = isRequired });
        }

        public void InsertEnumerationAttribute<T>(int entityType, int column, string name, string valueFormat = null, bool isRequired = false)
            where T : struct, IComparable, IFormattable, IConvertible
        {
            Insert.IntoTable("ExcelImport_Attributes")
                .Row(new { Type = 5, EntityTypeID = entityType, Name = name, Column = column, ValueFormat = valueFormat, IsRequired = isRequired, EnumerationType = typeof(T).AssemblyQualifiedName });
        }

        public void InsertDateAttribute(int entityType, int column, string name, string valueFormat = null, bool isRequired = false)
        {
            Insert.IntoTable("ExcelImport_Attributes")
                .Row(new { Type = 6, EntityTypeID = entityType, Name = name, Column = column, ValueFormat = valueFormat, IsRequired = isRequired });
        }

        public void InsertSiteDefinition()
        {
            InsertEntityType(1, "Site", "Sites", 2);
            InsertStringAttribute(1, 1, "Site Name", 100, isRequired: true);
            InsertFloatAttribute(1, 2, "Latitude", valueFormat: "{0:#.00000}", minInclusive: -90f, maxInclusive: 90f);
            InsertFloatAttribute(1, 3, "Longitude", valueFormat: "{0:#.00000}", minInclusive: -180f, maxInclusive: 180f);
            InsertStringAttribute(1, 4, "Measurer Contact", 100);
            InsertBooleanAttribute(1, 5, "Publicize Contact");
            InsertStringAttribute(1, 6, "Comments", 500);
            InsertStringAttribute(1, 7, "Report Url", 500);
        }

        public void InsertSubsiteDefinition()
        {
            InsertEntityType(2, "Subsite", "Subsites", 2);
            InsertStringAttribute(2, 1, "Site Name", 100, isRequired: true);
            InsertStringAttribute(2, 2, "Subsite Name", 100, isRequired: true);
            InsertEnumerationAttribute<ExcelImportState>(2, 3, "State", isRequired: true);
            InsertStringAttribute(2, 4, "County", 100, isRequired: true);
            InsertStringAttribute(2, 5, "Township", 100);
            InsertFloatAttribute(2, 6, "Latitude", valueFormat: "{0:#.00000}", minInclusive: -90f, maxInclusive: 90f);
            InsertFloatAttribute(2, 7, "Longitude", valueFormat: "{0:#.00000}", minInclusive: -180f, maxInclusive: 180f);
            InsertStringAttribute(2, 8, "Comments", 500);
            InsertEnumerationAttribute<ExcelImportSiteOwnershipType>(2, 9, "Ownership Type");
            InsertStringAttribute(2, 10, "Ownership Contact", 500);
            InsertBooleanAttribute(2, 11, "Publicize Contact");
        }

        public void InsertTreeDefinition()
        {
            InsertEntityType(3, "Tree", "Trees", 3);
            InsertStringAttribute(3, 1, "Subsite Name", 100, isRequired: true);
            InsertStringAttribute(3, 2, "Tree Name", 100);
            InsertStringAttribute(3, 3, "Common Name", 100, isRequired: true);
            InsertStringAttribute(3, 4, "Botanical Name", 100, isRequired: true);
            InsertFloatAttribute(3, 5, "Height", minExclusive: 0f);
            InsertEnumerationAttribute<ExcelImportHeightMeasurementMethod>(3, 6, "Height Measurement Method");
            InsertFloatAttribute(3, 7, "Girth", minExclusive: 0f);
            InsertFloatAttribute(3, 8, "Crown Max Spread", minExclusive: 0f);
            InsertDateAttribute(3, 9, "Date");
            InsertStringAttribute(3, 10, "First Measurer", 100);
            InsertStringAttribute(3, 11, "Second Measurer", 100);
            InsertStringAttribute(3, 12, "Third Measurer", 100);
            InsertEnumerationAttribute<ExcelImportTreeFormType>(3, 13, "Form Type");
            InsertStringAttribute(3, 14, "Form Comments", 500);
            InsertEnumerationAttribute<ExcelImportTreeStatus>(3, 15, "Status");
            InsertStringAttribute(3, 16, "Health Status", 100);
            InsertEnumerationAttribute<ExcelImportTreeAgeClass>(3, 17, "Age Class");
            InsertIntegerAttribute(3, 18, "Age", minInclusive: 1);
            InsertEnumerationAttribute<ExcelImportTreeAgeMethod>(3, 19, "Age Method");
            InsertEnumerationAttribute<ExcelImportTerrainType>(3, 20, "Terrain Type");
            InsertFloatAttribute(3, 21, "Latitude", valueFormat: "{0:#.00000}", minInclusive: -90f, maxInclusive: 90f);
            InsertFloatAttribute(3, 22, "Longitude", valueFormat: "{0:#.00000}", minInclusive: -180f, maxInclusive: 180f);
            InsertBooleanAttribute(3, 23, "Publicize Coordinates");
            InsertIntegerAttribute(3, 24, "Elevation", minInclusive: 1);
            InsertStringAttribute(3, 25, "General Comments", 500);
            InsertEnumerationAttribute<ExcelImportLaserBrand>(3, 26, "Height Laser Brand");
            InsertEnumerationAttribute<ExcelImportClinometerBrand>(3, 27, "Height Clinometer Brand");
            InsertEnumerationAttribute<ExcelImportHeightMeasurementType>(3, 28, "Height Measurement Type");
            InsertFloatAttribute(3, 29, "Height Distance Top", minExclusive: 0f);
            InsertFloatAttribute(3, 30, "Height Angle Top", minInclusive: 0f, maxExclusive: 90f);
            InsertFloatAttribute(3, 31, "Height Distance Bottom", minExclusive: 0f);
            InsertFloatAttribute(3, 32, "Height Angle Bottom", minInclusive: -90f, maxExclusive: 0f);
            InsertFloatAttribute(3, 33, "Height Vertical Offset");
            InsertStringAttribute(3, 34, "Height Comments", 500);
            InsertFloatAttribute(3, 35, "Girth Measurement Height");
            InsertFloatAttribute(3, 36, "Girth Root Collar Height");
            InsertStringAttribute(3, 37, "Girth Comments", 500);
            InsertFloatAttribute(3, 38, "Crown Average Spread", minExclusive: 0f);
            InsertEnumerationAttribute<ExcelImportCrownSpreadMeasurementMethod>(3, 39, "Crown Spread Measurement Method");
            InsertFloatAttribute(3, 40, "Crown Base Height", minExclusive: 0f);
            InsertFloatAttribute(3, 41, "Crown Area", minExclusive: 0f);
            InsertStringAttribute(3, 42, "Crown Area Measurement Method", 100);
            InsertFloatAttribute(3, 43, "Crown Volume", minExclusive: 0f);
            InsertEnumerationAttribute<ExcelImportCrownVolumeCalculationMethod>(3, 44, "Crown Volume Calculation Method");
            InsertStringAttribute(3, 45, "Crown Comments", 500);
            InsertFloatAttribute(3, 46, "Trunk Volume", minExclusive: 0f);
            InsertEnumerationAttribute<ExcelImportTrunkVolumeCalculationMethod>(3, 47, "Trunk Volume Calculation Method");
            InsertIntegerAttribute(3, 48, "Trunk Count", minInclusive: 1);
            InsertStringAttribute(3, 49, "Trunk Comments", 500);
            InsertFloatAttribute(3, 50, "Terrain Shape Index", minInclusive: -1f, maxInclusive: 1f);
            InsertFloatAttribute(3, 51, "Landform Index", minInclusive: 0f, maxInclusive: 1f);
            InsertStringAttribute(3, 52, "Terrain Comments", 500);
        }

        public void InsertTrunkDefinition()
        {
            InsertEntityType(4, "Trunk", "Trunks", 3);
            InsertStringAttribute(4, 1, "Tree Name", 100, isRequired: true);
            InsertFloatAttribute(4, 2, "Height", minExclusive: 0f);
            InsertFloatAttribute(4, 3, "Height Distance Top", minExclusive: 0f);
            InsertFloatAttribute(4, 4, "Height Angle Top", minInclusive: 0f, maxInclusive: 90f);
            InsertFloatAttribute(4, 5, "Height Distance Bottom", minExclusive: 0f);
            InsertFloatAttribute(4, 6, "Height Angle Bottom", minInclusive: -90f, maxInclusive: 0f);
            InsertFloatAttribute(4, 7, "Height Vertical Offset");
            InsertFloatAttribute(4, 8, "Girth", minExclusive: 0f);
            InsertFloatAttribute(4, 9, "Girth Measurement Height");
            InsertStringAttribute(4, 10, "Comments", 500);
        }
    }
}
