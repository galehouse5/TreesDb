using TMD.Model.Trees;

namespace TMD.Models.Browse
{
    public class BrowseSpeciesModel
    {
        public BrowseSpeciesDetailsModel GlobalDetails { get; set; }
        public BrowseSpeciesStateDetailsModel StateDetails { get; set; }
        public EntityGridModel<StateMeasuredSpecies> StateSpeciesModel { get; set; }
        public BrowseSpeciesSiteDetailsModel SiteDetails { get; set; }
        public EntityGridModel<SiteMeasuredSpecies> SiteSpeciesModel { get; set; }
        public EntityGridModel<Tree> TreesModel { get; set; }
    }
}