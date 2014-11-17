using FluentMigrator;

namespace Tmd.Migrations.Y2014
{
    [Migration(1)]
    public class M1_CreateExcelImportSchema : AutoReversingMigration
    {
        public override void Up()
        {
            Create.Table("ExcelImport_Entities")
                .WithColumn("ID").AsInt32().PrimaryKey().Identity()
                .WithColumn("EntityTypeID").AsInt32()
                .WithColumn("UserID").AsInt32().ForeignKey("FK_ExcelImport_Entities_UserID_Users.Users_Id", "Users", "Users", "Id").Indexed()
                .WithColumn("RowIndex").AsInt32();

            Create.Table("ExcelImport_Values")
                .WithColumn("ID").AsInt32().PrimaryKey().Identity()
                .WithColumn("Type").AsByte()
                .WithColumn("EntityID").AsInt32().ForeignKey("ExcelImport_Entities", "ID").Indexed()
                .WithColumn("AttributeID").AsInt32()
                .WithColumn("BooleanValue").AsBoolean().Nullable()
                .WithColumn("DateValue").AsDate().Nullable()
                .WithColumn("ByteValue").AsByte().Nullable()
                .WithColumn("FloatValue").AsFloat().Nullable()
                .WithColumn("IntegerValue").AsInt32().Nullable()
                .WithColumn("StringValue").AsString(500).Nullable();
        }
    }
}
