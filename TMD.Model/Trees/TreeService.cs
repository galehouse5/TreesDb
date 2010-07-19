using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using Microsoft.Practices.Unity;

namespace TMD.Model.Trees
{
    public interface ITreeRepository
    {
        IList<KnownTree> FindTreesWithSimilarCommonName(string commonName, int results);
    }

    public static class TreeService
    {
        private static ITreeRepository s_Repository = ModelRegistry.RepositoryFactory.Resolve<ITreeRepository>();

        public static IList<KnownTree> FindTreesWithSimilarCommonName(string commonName, int results)
        {
            return s_Repository.FindTreesWithSimilarCommonName(commonName, results);
        }
    }
}
