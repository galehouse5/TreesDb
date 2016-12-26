using System.Collections.Generic;
using TMD.Model.Extensions;

namespace TMD.Models.Browse
{
    public class BrowseTreeModel
    {
        public BrowseTreeDetailsModel Details { get; set; }
        public IList<BrowseTreeDetailsModel> MeasurementDetails { get; set; }
        public IList<BrowsePhotoSumaryModel> PhotoSummaries { get; set; }
        public BrowseTreeLocationModel Location { get; set; }

        public bool ShowMap => Location.Coordinates.IsValidAndSpecified()
            || Location.CalculatedCoordinates.IsValidAndSpecified();
    }
}