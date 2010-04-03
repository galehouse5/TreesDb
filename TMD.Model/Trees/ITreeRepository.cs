using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using TMD.Model.Sites;

namespace TMD.Model.Trees
{
    interface ITreeRepository
    {
        Tree FindBy(Guid id);
        void Update(Tree tree);

        IList<Tree> FindUniqueSpeciesOfGreatestHeightByCountry(Country c);
        IList<Tree> FindUniqueSpeciesOfGreatestHeightByState(State s);
        IList<Tree> FindUniqueSpeciesOfGreatestHeightByCounty(string c);
        IList<Tree> FindUniqueSpeciesOfGreatestHeightBySite(Site s);
        IList<Tree> FindUniqueSpeciesOfGreatestHeightBySubsite(Subsite s);

        IList<Tree> FindUniqueSpeciesWithSingleTrunkOfGreatestGirthByCountry(Country c);
        IList<Tree> FindUniqueSpeciesWithSingleTrunkOfGreatestGirthtByState(State s);
        IList<Tree> FindUniqueSpeciesWithSingleTrunkOfGreatestGirthByCounty(string c);
        IList<Tree> FindUniqueSpeciesWithSingleTrunkOfGreatestGirthBySite(Site s);
        IList<Tree> FindUniqueSpeciesWithSingleTrunkOfGreatestGirthBySubsite(Subsite s);

        Tree FindTreeOfGreatestHeightBySpecies(string s);
        Tree FindTreeOfGreatestGirthBySpecies(string s);
        Tree FindTreeOfGreatestTDICrownSpreadBySpecies(string s);
    }
}
