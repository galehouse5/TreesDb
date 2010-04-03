using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;

namespace TMD.Model.Trees
{
    public static class TreeService
    {
        private static ITreeRepository m_Repository 
            = ModelRegistry.RepositoryFactory.Instantiate<ITreeRepository>();

        public static Tree FindTreeOfGreatestHeightBySpecies(string s)
        {
            return m_Repository.FindTreeOfGreatestHeightBySpecies(s);
        }

        public static Tree FindTreeOfGreatestGirthBySpecies(string s)
        {
            return m_Repository.FindTreeOfGreatestGirthBySpecies(s);
        }

        public static Tree FindTreeOfGreatestTDICrownSpreadBySpecies(string s)
        {
            return m_Repository.FindTreeOfGreatestTDICrownSpreadBySpecies(s);
        }
    }
}
