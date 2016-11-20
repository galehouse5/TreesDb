using TMD.Model.Imports;

namespace TMD.Models.Import
{
    public class ImportMenuWidgetModel
    {
        public bool IsSelected { get; set; }
        public bool CanImport { get; set; }
        public Trip LatestTrip { get; set; }
    }
}