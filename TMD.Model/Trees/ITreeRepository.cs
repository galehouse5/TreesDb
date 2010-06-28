using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;

namespace TMD.Model.Trees
{
    public interface ITreeRepository
    {
        //void Add(Tree tree);
        //Tree FindById(object id);
        //void Update(Tree tree);
        //void Remove(Tree tree);

        IList<KnownTree> FindTreesWithSimilarCommonName(string commonName, int results);
    }
}
