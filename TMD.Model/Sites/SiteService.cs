//using System;
//using System.Collections.Generic;
//using System.Linq;
//using System.Text;
//using Microsoft.Practices.Unity;

//namespace TMD.Model.Sites
//{
//    public static class SiteService
//    {
//        private static ISiteRepository s_Repository = ModelRegistry.RepositoryFactory.Resolve<ISiteRepository>();

//        public static void Add(Site site)
//        {
//            s_Repository.Add(site);
//        }

//        public static Site FindById(object id)
//        {
//            return s_Repository.FindById(id);
//        }

//        public static void Update(Site site)
//        {
//            s_Repository.Update(site);
//        }

//        public static void Remove(Site site)
//        {
//            s_Repository.Remove(site);
//        }

//        public static void RecomputeCoordinates(Site site)
//        {
//            s_Repository.RecomputeCoordinates(site);
//        }
//    }
//}
