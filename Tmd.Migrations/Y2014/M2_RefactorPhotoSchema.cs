using FluentMigrator;

namespace Tmd.Migrations.Y2014
{
    [Migration(2)]
    public class M2_RefactorPhotoSchema : Migration
    {
        public override void Up()
        {
            Execute.Sql("alter schema dbo transfer Photos.Photos");
            Execute.Sql("alter schema dbo transfer Photos.[References]");

            Delete.Schema("Photos");

            Rename.Table("Photos").To("PhotoFiles");
            Rename.Table("References").To("PhotoReferences");

            Rename.Column("Bytes").OnTable("PhotoFiles").To("Size");
            Create.Column("Filename").OnTable("PhotoFiles").AsString(500).Nullable();
            Rename.Column("PhotoId").OnTable("PhotoReferences").To("PhotoFileId");
            Rename.Column("TreeMeasurementId").OnTable("PhotoReferences").To("MeasurementId");

            // remove orphaned photo references
            Execute.Sql("delete from dbo.PhotoReferences where PhotoFileId not in (select Id from dbo.PhotoFiles)");
            Create.ForeignKey().FromTable("PhotoReferences").ForeignColumn("PhotoFileId")
                .ToTable("PhotoFiles").PrimaryColumn("Id");

            // remove orphaned photos (this may create orphaned files that will need to be cleaned up later)
            Execute.Sql("delete from dbo.PhotoFiles where Id not in (select PhotoFileId from dbo.PhotoReferences)");

            Execute.Sql(
@"update [file]
set Filename = filename.Filename
from
(
	select Id,
		case (row_number() over (partition by CreatorUserID, Type, Filename order by ID))
			when 1 then Filename
			else Filename + ' (' + convert(varchar, (row_number() over (partition by CreatorUserID, Type, Filename order by ID)) - 1) + ')'
		end + '.' + Extension Filename
	from
	(
		select [file].Id,
			[file].CreatorUserId,
			reference.Type,
			case reference.Type
				when 1 then 'Public ' + convert(varchar, reference.PhotoFileId)
				when 2 then case importSubsite.Name when '' then 'Subsite ' + convert(varchar, importSubsite.Id) else importSubsite.Name end
				when 3 then case importTree.CommonName when '' then 'Tree' else importTree.CommonName end + ' ' + convert(varchar, importTree.Id)
			end Filename,
			case [file].Format
				when 1 then 'jpg'
				when 2 then 'gif'
				when 3 then 'png'
			end Extension
		from dbo.PhotoFiles [file]
		join dbo.PhotoReferences reference
			on reference.PhotoFileId = [file].Id
		left join Imports.Subsites importSubsite
			on importSubsite.Id = reference.ImportSubsiteId
		left join Imports.Trees importTree
			on importTree.Id = reference.ImportTreeId
		where reference.Type in (1, 2, 3)
	) [file]
) filename
join dbo.PhotoFiles [file]
	on [file].Id = filename.Id");

            Alter.Column("Filename").OnTable("PhotoFiles").AsString(500).NotNullable();
        }

        public override void Down()
        {
            Delete.ForeignKey().FromTable("PhotoReferences").ForeignColumn("PhotoFileId")
                .ToTable("PhotoFiles").PrimaryColumn("Id");

            Rename.Column("MeasurementId").OnTable("PhotoReferences").To("TreeMeasurementId");
            Rename.Column("PhotoFileId").OnTable("PhotoReferences").To("PhotoId");
            Delete.Column("Filename").FromTable("PhotoFiles");
            Rename.Column("Size").OnTable("PhotoFiles").To("Bytes");

            Rename.Table("PhotoReferences").To("References");
            Rename.Table("PhotoFiles").To("Photos");

            Create.Schema("Photos");

            Execute.Sql("alter schema Photos transfer dbo.Photos");
            Execute.Sql("alter schema Photos transfer dbo.[References]");
        }
    }
}
