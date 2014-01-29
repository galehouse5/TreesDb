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
                .WithColumn("Name").AsAnsiString()
                .WithColumn("Spreadsheet").AsAnsiString()
                .WithColumn("StartRow").AsInt32();

            Create.Table("ExcelImport_Entities")
                .WithColumn("ID").AsInt32().PrimaryKey().Identity()
                .WithColumn("EntityTypeID").AsInt32().ForeignKey("ExcelImport_EntityTypes", "ID")
                .WithColumn("UserID").AsInt32().ForeignKey("FK_ExcelImport_Entities_UserID_Users.Users_Id", "Users", "Users", "Id")
                .WithColumn("Row").AsInt32();

            Create.Table("ExcelImport_Attributes")
                .WithColumn("ID").AsInt32().PrimaryKey().Identity()
                .WithColumn("Type").AsByte()
                .WithColumn("EntityTypeID").AsInt32().ForeignKey("ExcelImport_EntityTypes", "ID")
                .WithColumn("Name").AsAnsiString()
                .WithColumn("Column").AsInt32()
                .WithColumn("IsRequired").AsBoolean()
                .WithColumn("EnumerationType").AsAnsiString().Nullable()
                .WithColumn("MinNumberInclusive").AsDecimal().Nullable()
                .WithColumn("MaxNumberInclusive").AsDecimal().Nullable()
                .WithColumn("MinNumberExclusive").AsDecimal().Nullable()
                .WithColumn("MaxNumberExclusive").AsDecimal().Nullable()
                .WithColumn("MaxStringLength").AsInt32().Nullable();

            Create.Table("ExcelImport_Values")
                .WithColumn("ID").AsInt32().PrimaryKey().Identity()
                .WithColumn("Type").AsByte()
                .WithColumn("EntityID").AsInt32().ForeignKey("ExcelImport_Entities", "ID")
                .WithColumn("AttributeID").AsInt32().ForeignKey("ExcelImport_Attributes", "ID")
                .WithColumn("BooleanValue").AsBoolean().Nullable()
                .WithColumn("DateValue").AsDate().Nullable()
                .WithColumn("EnumerationValue").AsByte().Nullable()
                .WithColumn("NumberValue").AsDecimal().Nullable()
                .WithColumn("StringValue").AsString().Nullable();

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

        public void InsertNumberAttribute(int entityType, int column, string name, bool isRequired = false, int? minInclusive = null, int? maxInclusive = null, int? minExclusive = null, int? maxExclusive = null)
        {
            Insert.IntoTable("ExcelImport_Attributes")
                .Row(new { Type = 1, EntityTypeID = entityType, Name = name, Column = column, IsRequired = isRequired, MinNumberInclusive = minInclusive, MaxNumberInclusive = maxInclusive, MinNumberExclusive = minExclusive, MaxNumberExclusive = maxExclusive });
        }

        public void InsertStringAttribute(int entityType, int column, string name, int maxLength, bool isRequired = false)
        {
            Insert.IntoTable("ExcelImport_Attributes")
                .Row(new { Type = 2, EntityTypeID = entityType, Name = name, Column = column, IsRequired = isRequired, MaxStringLength = maxLength });
        }

        public void InsertBooleanAttribute(int entityType, int column, string name, bool isRequired = false)
        {
            Insert.IntoTable("ExcelImport_Attributes")
                .Row(new { Type = 3, EntityTypeID = entityType, Name = name, Column = column, IsRequired = isRequired });
        }

        public void InsertEnumerationAttribute<T>(int entityType, int column, string name, bool isRequired = false)
            where T : struct, IComparable, IFormattable, IConvertible
        {
            Insert.IntoTable("ExcelImport_Attributes")
                .Row(new { Type = 4, EntityTypeID = entityType, Name = name, Column = column, IsRequired = isRequired, EnumerationType = typeof(T).AssemblyQualifiedName });
        }

        public void InsertDateAttribute(int entityType, int column, string name, bool isRequired = false)
        {
            Insert.IntoTable("ExcelImport_Attributes")
                .Row(new { Type = 5, EntityTypeID = entityType, Name = name, Column = column, IsRequired = isRequired });
        }

        public void InsertSiteDefinition()
        {
            InsertEntityType(1, "Site", "Sites", 2);
            InsertNumberAttribute(1, 1, "Site ID", minInclusive: 1);
            InsertStringAttribute(1, 2, "Site Name", 100, isRequired: true);
            InsertNumberAttribute(1, 3, "Latitude", minInclusive: -90, maxInclusive: 90);
            InsertNumberAttribute(1, 4, "Longitude", minInclusive: -180, maxInclusive: 180);
            InsertBooleanAttribute(1, 5, "Pick Coordinates");
            InsertStringAttribute(1, 6, "First Measurer", 100, isRequired: true);
            InsertStringAttribute(1, 7, "Second Measurer", 100);
            InsertStringAttribute(1, 8, "Third Measurer", 100);
            InsertStringAttribute(1, 9, "Measurer Contact", 100);
            InsertBooleanAttribute(1, 10, "Publicize Measurer Contact");
            InsertStringAttribute(1, 11, "Comments", 500);
            InsertBooleanAttribute(1, 12, "Upload Photos");
            InsertStringAttribute(1, 13, "Report Url", 500);
            InsertNumberAttribute(1, 14, "Visit ID", minInclusive: 1);
        }

        public void InsertSubsiteDefinition()
        {
            InsertEntityType(2, "Subsite", "Subsites", 2);
            InsertStringAttribute(2, 1, "Site Name", 100, isRequired: true);
            InsertNumberAttribute(2, 2, "Subsite ID", minInclusive: 1);
            InsertStringAttribute(2, 3, "Subsite Name", 100, isRequired: true);
            InsertEnumerationAttribute<ExcelImportState>(2, 4, "State", isRequired: true);
            InsertStringAttribute(2, 5, "County", 100, isRequired: true);
            InsertStringAttribute(2, 6, "Township", 100);
            InsertNumberAttribute(2, 7, "Latitude", minInclusive: -90, maxInclusive: 90);
            InsertNumberAttribute(2, 8, "Longitude", minInclusive: -180, maxInclusive: 180);
            InsertBooleanAttribute(2, 9, "Pick Coordinates");
            InsertStringAttribute(2, 10, "Commtents", 500);
            InsertEnumerationAttribute<ExcelImportSiteOwnershipType>(2, 11, "Ownership Type");
            InsertStringAttribute(2, 12, "Ownership Contact Info", 500);
            InsertBooleanAttribute(2, 13, "Publicize Ownership Contact Info");
            InsertBooleanAttribute(2, 14, "Upload Photos");
            InsertNumberAttribute(2, 15, "Visit ID");
        }

        public void InsertTreeDefinition()
        {
            InsertEntityType(3, "Tree", "Trees", 3);
            InsertStringAttribute(3, 1, "Subsite Name", 100, isRequired: true);
            InsertNumberAttribute(3, 2, "Tree ID", minInclusive: 1);
            InsertStringAttribute(3, 3, "Tree Name", 100);
            InsertStringAttribute(3, 4, "Common Name", 100, isRequired: true);
            InsertStringAttribute(3, 5, "Botanical Name", 100, isRequired: true);
            InsertNumberAttribute(3, 6, "Height", minExclusive: 0);
            InsertEnumerationAttribute<ExcelImportHeightMeasurementMethod>(3, 7, "Height Measurement Method");
            InsertEnumerationAttribute<ExcelImportLaserBrand>(3, 8, "Height Laser Brand");
            InsertEnumerationAttribute<ExcelImportClinometerBrand>(3, 9, "Height Clinometer Brand");
            InsertEnumerationAttribute<ExcelImportHeightMeasurementType>(3, 10, "Height Measurement Type");
            InsertNumberAttribute(3, 11, "Height Distance Top", minExclusive: 0);
            InsertNumberAttribute(3, 12, "Height Angle Top", minInclusive: 0, maxExclusive: 90);
            InsertNumberAttribute(3, 13, "Height Distance Bottom", minExclusive: 0);
            InsertNumberAttribute(3, 14, "Height Angle Bottom", minInclusive: -90, maxExclusive: 0);
            InsertNumberAttribute(3, 15, "Height Vertical Offset");
            InsertStringAttribute(3, 16, "Height Comments", 500);
            InsertNumberAttribute(3, 17, "Girth", minExclusive: 0);
            InsertNumberAttribute(3, 18, "Girth Measurement Height");
            InsertNumberAttribute(3, 19, "Girth Root Collar Height");
            InsertStringAttribute(3, 20, "Girth Comments", 500);
            InsertNumberAttribute(3, 21, "Crown Max Spread", minExclusive: 0);
            InsertNumberAttribute(3, 22, "Crown Average Spread", minExclusive: 0);
            InsertEnumerationAttribute<ExcelImportCrownSpreadMeasurementMethod>(3, 23, "Crown Spread Measurement Method");
            InsertNumberAttribute(3, 24, "Crown Base Height", minExclusive: 0);
            InsertNumberAttribute(3, 25, "Crown Area", minExclusive: 0);
            InsertStringAttribute(3, 26, "Crown Area Measurement Method", 100);
            InsertNumberAttribute(3, 27, "Crown Volume", minExclusive: 0);
            InsertEnumerationAttribute<ExcelImportCrownVolumeCalculationMethod>(3, 28, "Crown Volume Calculation Method");
            InsertStringAttribute(3, 29, "Crown Comments", 500);
            InsertNumberAttribute(3, 30, "Trunk Volume", minExclusive: 0);
            InsertEnumerationAttribute<ExcelImportTrunkVolumeCalculationMethod>(3, 31, "Trunk Volume Calculation Method");
            InsertNumberAttribute(3, 32, "Trunk Count", minInclusive: 1);
            InsertStringAttribute(3, 33, "Trunk Comments", 500);
            InsertEnumerationAttribute<ExcelImportTreeFormType>(3, 34, "Form Type");
            InsertStringAttribute(3, 35, "Form Comments", 500);
            InsertEnumerationAttribute<ExcelImportTreeStatus>(3, 36, "Status");
            InsertStringAttribute(3, 37, "Health Status", 100);
            InsertEnumerationAttribute<ExcelImportTreeAgeClass>(3, 38, "Age Class");
            InsertNumberAttribute(3, 39, "Age", minExclusive: 0);
            InsertEnumerationAttribute<ExcelImportTreeAgeMethod>(3, 40, "Age Method");
            InsertEnumerationAttribute<ExcelImportTerrainType>(3, 41, "Terrain Type");
            InsertNumberAttribute(3, 42, "Terrain Shape Index", minInclusive: -1, maxInclusive: 1);
            InsertNumberAttribute(3, 43, "Landform Index", minInclusive: 0, maxInclusive: 1);
            InsertStringAttribute(3, 44, "Terrain Comments", 500);
            InsertDateAttribute(3, 45, "Date");
            InsertNumberAttribute(3, 46, "Latitude", minInclusive: -90, maxInclusive: 90);
            InsertNumberAttribute(3, 47, "Longitude", minInclusive: -180, maxInclusive: 180);
            InsertBooleanAttribute(3, 48, "Pick Coordinates");
            InsertBooleanAttribute(3, 49, "Publicize Coordinates");
            InsertNumberAttribute(3, 50, "Elevation", minInclusive: 1);
            InsertStringAttribute(3, 51, "General Comments", 500);
            InsertBooleanAttribute(3, 52, "Upload Photos");
            InsertNumberAttribute(3, 53, "Measurement ID", minInclusive: 1);
        }

        public void InsertTrunkDefinition()
        {
            InsertEntityType(4, "Trunk", "Trunks", 2);
            InsertStringAttribute(4, 1, "Tree Name", 100, isRequired: true);
            InsertNumberAttribute(4, 2, "Height", minExclusive: 0);
            InsertNumberAttribute(4, 3, "Height Distance Top", minExclusive: 0);
            InsertNumberAttribute(4, 4, "Height Angle Top", minInclusive: 0, maxInclusive: 90);
            InsertNumberAttribute(4, 5, "Height Distance Bottom", minExclusive: 0);
            InsertNumberAttribute(4, 6, "Height Angle Bottom", minInclusive: -90, maxInclusive: 0);
            InsertNumberAttribute(4, 7, "Height Vertical Offset");
            InsertNumberAttribute(4, 8, "Girth", minExclusive: 0);
            InsertNumberAttribute(4, 9, "Girth Measurement Height");
            InsertStringAttribute(4, 10, "Comments", 500);
        }
    }
}
