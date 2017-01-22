using CsvHelper;
using FluentMigrator;
using System.IO;
using System.Reflection;

namespace Tmd.Migrations.Y2017
{
    [Migration(4)]
    public class M004_UpdateStateCoordinates : Migration
    {
        private class LocationCoordinateData
        {
            public string Country { get; set; }
            public string State { get; set; }
            public string BoundingBox { get; set; }

            public float SouthLatitude => float.Parse(BoundingBox.Split(',')[0]);
            public float NorthLatitude => float.Parse(BoundingBox.Split(',')[1]);
            public float WestLongitude => float.Parse(BoundingBox.Split(',')[2]);
            public float EastLongitude => float.Parse(BoundingBox.Split(',')[3]);

            protected string UpdateStateSql => $@"
update s
set SWLatitude = {SouthLatitude},
    NELatitude = {NorthLatitude},
    SWLongitude = {WestLongitude},
    NELongitude = {EastLongitude}
from Locations.States s
join Locations.Countries c
    on c.Id = s.CountryId
where c.Name = '{Country}'
    and s.Name = '{State}'";

            protected string UpdateCountrySql => $@"
update Locations.Countries
set SWLatitude = {SouthLatitude},
    NELatitude = {NorthLatitude},
    SWLongitude = {WestLongitude},
    NELongitude = {EastLongitude}
from Locations.Countries
where Name = '{Country}'";

            public string UpdateSql
                => string.IsNullOrEmpty(State) ? UpdateCountrySql : UpdateStateSql;
        }

        public override void Up()
        {
            Execute.Sql($@"
delete s
from Locations.States s
join Locations.Countries c
    on c.Id = s.CountryId
where c.Name = 'Mexico'
    and s.Name = 'Mexico'");

            using (Stream data = Assembly.GetExecutingAssembly()
                // Extracted from OpenStreetMap data using Nominatim search engine API.  Here's an example that gets
                // coordinate bounds for the state of Ohio: http://nominatim.openstreetmap.org/search?format=xml&q=Ohio,%20United%20States
                .GetManifestResourceStream("Tmd.Migrations.Y2017.M004_LocationCoordinateData.csv"))
            using (TextReader reader = new StreamReader(data))
            using (ICsvReader csv = new CsvReader(reader))
            {
                foreach (LocationCoordinateData record in csv.GetRecords<LocationCoordinateData>())
                {
                    Execute.Sql(record.UpdateSql);
                }
            }
        }

        public override void Down()
        { }
    }
}
