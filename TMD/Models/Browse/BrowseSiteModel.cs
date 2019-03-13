using System.Collections.Generic;
using TMD.Model.Extensions;
using TMD.Model.Trees;

namespace TMD.Models.Browse
{
    public class BrowseSiteModel
    {
        public int Id { get; set; }
        public BrowseSiteDetailsModel Details { get; set; }
        public IList<BrowsePhotoSumaryModel> PhotoSummaries { get; set; }
        public BrowseSiteLocationModel Location { get; set; }
        public IList<BrowseSiteVisitModel> Visits { get; set; }
        public EntityGridModel<SiteMeasuredSpecies> SiteSpeciesModel { get; set; }

        public bool ShowMap => Location.Coordinates.IsValidAndSpecified()
            || Location.CalculatedCoordinates.IsValidAndSpecified();
    }
}