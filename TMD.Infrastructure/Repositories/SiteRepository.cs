//using System;
//using System.Collections.Generic;
//using System.Linq;
//using System.Text;
//using TMD.Model.Sites;
//using NHibernate;
//using TMD.Model;
//using Microsoft.Practices.EnterpriseLibrary.Validation;

//namespace TMD.Infrastructure.Repositories
//{
//    public class SiteRepository : ISiteRepository
//    {
//        public void Add(Site site)
//        {
//            ValidationResults vr = EntityValidator.ValidateRegardingAllRules(site);
//            if (!vr.IsValid)
//            {
//                throw new ApplicationException("Unable to add site due to validation failure.");
//            }
//            if (site.IsImported)
//            {
//                throw new ApplicationException("Unable to add site that has already been imported.");
//            }
//            foreach (Subsite ss in site.Subsites)
//            {
//                if (ss.IsImported)
//                {
//                    throw new ApplicationException("Unable to add subsite that has already been imported.");
//                }
//            }
//            InfrastructureRegistry.UnitOfWorkSession.Save(site);
//        }

//        public Site FindById(object id)
//        {
//            return InfrastructureRegistry.UnitOfWorkSession.Get<Site>(id);
//        }

//        public void Update(Site site)
//        {
//            if (site.IsImported)
//            {
//                throw new ApplicationException("Unable to update site that has already been imported.");
//            }
//            foreach (Subsite ss in site.Subsites)
//            {
//                if (ss.IsImported)
//                {
//                    throw new ApplicationException("Unable to update subsite that has already been imported.");
//                }
//            }
//            InfrastructureRegistry.UnitOfWorkSession.Update(site);
//        }

//        public void Remove(Site site)
//        {
//            InfrastructureRegistry.UnitOfWorkSession.Delete(site);
//        }

//        public void RecomputeCoordinates(Site site)
//        {
//                InfrastructureRegistry.UnitOfWorkSession.CreateSQLQuery(@"
//                    update ss
//                    set latitude = coalesce
//						(
//		                    (
//                                select avg(m.latitude)
//		                        from dbo.trees t
//		                        inner join dbo.measurements m
//									on m.id = t.currentmeasurementid
//		                        where m.latitude != 0 and m.longitude != 0
//		                        and t.subsiteid = ss.id
//							),
//							ss.latitude
//                        ),
//	                    longitude = coalesce
//	                    (
//		                    (
//                                select avg(m.longitude)
//		                        from dbo.trees t
//		                        inner join dbo.measurements m
//									on m.id = t.currentmeasurementid
//		                        where m.latitude != 0 and m.longitude != 0
//		                        and t.subsiteid = ss.id
//							),
//							ss.longitude
//						)
//                    from dbo.subsites ss
//                    inner join dbo.sites s
//						on s.Id = ss.SiteId
//					where s.Id = :id")
//                    .SetParameter("id", site.Id)
//                    .ExecuteUpdate();
//            InfrastructureRegistry.UnitOfWorkSession.CreateSQLQuery(@"
//                update s
//                set latitude = 
//	                (
//		                select avg(latitude)
//		                from dbo.subsites
//		                where siteid = s.id
//	                ),
//	                longitude =
//	                (
//		                select avg(longitude)
//		                from dbo.subsites
//		                where siteid = s.id
//	                )
//                from sites s
//                where s.id = :id")
//                .SetParameter("id", site.Id)
//                .ExecuteUpdate();
//            InfrastructureRegistry.UnitOfWorkSession.Refresh(site);
//        }
//    }
//}
