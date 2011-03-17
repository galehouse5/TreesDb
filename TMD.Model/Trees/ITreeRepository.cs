using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;

namespace TMD.Model.Trees
{
    public interface ITreeRepository
    {
        void Save(Tree tree);
        Tree FindById(int id);
        IList<Tree> ListAll();
        IList<Tree> ListByBotanicalNameAndSiteId(string botanicalName, int siteId);
        void RemoveMeasurementsByTrip(Imports.Trip trip);

        IList<KnownSpecies> ListKnownSpeciesBySimilarCommonName(string commonName, int results);
        IList<KnownSpecies> ListKnownSpeciesBySimilarScientificName(string scientificName, int results);

        EntityPage<T> ListAllMeasuredSpecies<T>(SpeciesBrowser browser) where T : MeasuredSpecies;
        GlobalMeasuredSpecies FindMeasuredSpeciesByBotanicalName(string botanicalName);
        StateMeasuredSpecies FindMeasuredSpeciesByBotanicalNameAndStateId(string botanicalName, int stateId);
        SiteMeasuredSpecies FindMeasuredSpeciesByBotanicalNameAndSiteId(string botanicalName, int siteId);
        SubsiteMeasuredSpecies FindMeasuredSpeciesByBotanicalNameAndSubsiteId(string botanicalName, int subsiteId);
        IList<StateMeasuredSpecies> ListMeasuredSpeciesForStatesByBotanicalName(string botanicalName);
        IList<SiteMeasuredSpecies> ListMeasuredSpeciesForSitesByBotanicalNameAndStateId(string botanicalName, int stateId);
        IList<SubsiteMeasuredSpecies> ListMeasuredSpeciesBySubsiteId(int id);
        IList<StateMeasuredSpecies> ListMeasuredSpeciesByStateId(int id);
    }

    public class SpeciesBrowser : IPagingOptions
    {
        public enum Property { BotanicalName, CommonName }
        public Property? SortProperty { get; set; }
        public bool SortAscending { get; set; }
        public string BotanicalNameFilter { get; set; }
        public string CommonNameFilter { get; set; }
        public int PageIndex { get; set; }
        public int PageSize { get; set; }
    }
}
