using System.Collections.Generic;
using TMD.Model.Extensions;
using TMD.Model.Trees;

namespace TMD.Models.Browse
{
    public class BrowseSiteModel
    {
        public int Id { get; set; }
        public BrowseSubsiteDetailsModel Details { get; set; }
        public IList<BrowsePhotoSumaryModel> PhotoSummaries { get; set; }
        public BrowseSubsiteLocationModel Location { get; set; }
        public IList<BrowseSiteVisitModel> Visits { get; set; }
        public EntityGridModel<SubsiteMeasuredSpecies> SubsiteSpeciesModel { get; set; }

        public bool ShowMap => Location.Coordinates.IsValidAndSpecified()
            || Location.CalculatedCoordinates.IsValidAndSpecified();
    }
}