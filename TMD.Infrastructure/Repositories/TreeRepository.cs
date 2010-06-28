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
        //public void Add(Tree tree)
        //{
        //    ValidationResults vr = EntityValidator.ValidateRegardingAllRules(tree);
        //    if (!vr.IsValid)
        //    {
        //        throw new ApplicationException("Unable to add tree due to validation failure.");
        //    }
        //    if (tree.IsImported)
        //    {
        //        throw new ApplicationException("Unable to add tree that has already been imported.");
        //    }
        //    foreach (Measurement m in tree.AllMeasurements)
        //    {
        //        if (m.IsImported)
        //        {
        //            throw new ApplicationException("Unable to add measurement that has already been imported.");
        //        }
        //        foreach (Measurer measurer in m.Measurers)
        //        {
        //            if (measurer.IsImported)
        //            {
        //                throw new ApplicationException("Unable to add measurement that has already been imported.");
        //            }
        //        }
        //    }
        //    InfrastructureRegistry.UnitOfWorkSession.Save(tree);
        //}

        //public Tree FindById(object id)
        //{
        //    return InfrastructureRegistry.UnitOfWorkSession.Get<Tree>(id);
        //}

        //public void Update(Tree tree)
        //{
        //    if (tree.IsImported)
        //    {
        //        throw new ApplicationException("Unable to update tree that has already been imported.");
        //    }
        //    foreach (Measurement m in tree.AllMeasurements)
        //    {
        //        if (m.IsImported)
        //        {
        //            throw new ApplicationException("Unable to update measurement that has already been imported.");
        //        }
        //        foreach (Measurer measurer in m.Measurers)
        //        {
        //            if (measurer.IsImported)
        //            {
        //                throw new ApplicationException("Unable to update measurement that has already been imported.");
        //            }
        //        }
        //    }
        //    InfrastructureRegistry.UnitOfWorkSession.Update(tree);
        //}

        //public void Remove(Tree tree)
        //{
        //    InfrastructureRegistry.UnitOfWorkSession.Delete(tree);
        //}

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
