using System.Collections.Generic;

namespace TMD.Models.Browse
{
    public class BrowseTreeModel
    {
        public BrowseTreeDetailsModel Details { get; set; }
        public IList<BrowseTreeDetailsModel> MeasurementDetails { get; set; }
        public IList<BrowsePhotoSumaryModel> PhotoSummaries { get; set; }
        public BrowseTreeLocationModel Location { get; set; }
    }
}