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
        PagedList<Tree> ListAll(TreeBrowser browser);
    }

    public class TreeBrowser : IListPager
    {
        public enum Property { Species, Height, Girth, Site }
        public Property? SortProperty { get; set; }
        public bool SortAscending { get; set; }
        public string SpeciesFilter { get; set; }
        public string SiteFilter { get; set; }
        public int PageIndex { get; set; }
        public int PageSize { get; set; }
    }
}
