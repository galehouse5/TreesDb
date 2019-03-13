using FluentMigrator;

namespace Tmd.Migrations.Y2019
{
    [Migration(6)]
    public class M006_NormalizeCountyNames : Migration
    {
        public override void Up()
        {
            Execute.Sql(@"
update Sites.Sites
set County = replace(County, ' County', '')
where County like '% County'");

            Execute.Sql(@"
update Imports.Sites
set County = replace(County, ' County', '')
where County like '% County'");
        }

        public override void Down()
        { }
    }
}
