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
    }
}
