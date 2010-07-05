using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using TMD.Model.Trees;
using Microsoft.Practices.EnterpriseLibrary.Validation;
using TMD.Model;
using NHibernate;

namespace TMD.Infrastructure.Repositories
{
    public class TreeRepository : ITreeRepository
    {
        public IList<KnownTree> FindTreesWithSimilarCommonName(string commonName, int results)
        {
            using (ISession session = InfrastructureRegistry.SessionFactory.OpenSession())
            {
                return session.CreateSQLQuery("exec Trees.FindSimilarKnownTrees :searchTerms, :results")
                    .AddEntity(typeof(KnownTree))
                    .SetString("searchTerms", commonName)
                    .SetInt32("results", results)
                    .List<KnownTree>();
            }
        }
    }
}
