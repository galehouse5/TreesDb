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
        IList<KnownSpecies> FindKnownSpeciesBySimilarCommonName(string commonName, int results);
        IList<KnownSpecies> FindKnownSpeciesBySimilarScientificName(string scientificName, int results);
        void RemoveMeasurementsByTrip(Imports.Trip trip);
        IList<Tree> ListAll();
        EntityPage<T> ListAllMeasuredSpecies<T>(SpeciesBrowser browser) where T : MeasuredSpecies;
        T FindMeasuredSpeciesById<T>(int id) where T : MeasuredSpecies;
        IList<StateMeasuredSpecies> FindStateMeasuredSpeciesByBotanicalName(string botanicalName);
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
