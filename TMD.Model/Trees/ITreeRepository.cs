using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;

namespace TMD.Model.Trees
{
    public interface ITreeRepository
    {
        IList<KnownTree> FindTreesWithSimilarCommonName(string commonName, int results);
    }
}
