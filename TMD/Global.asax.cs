using AutoMapper;
using log4net.Config;
using StructureMap;
using System.Configuration;
using System.Web.Mvc;
using System.Web.Optimization;
using System.Web.Routing;
using Tmd.WindowsAzure;
using TMD.Infrastructure;
using TMD.Infrastructure.Repositories;
using TMD.Mappings;
using TMD.Model;
using TMD.Model.Photos;

namespace TMD
{
    // Note: For instructions on enabling IIS6 or IIS7 classic mode, 
    // visit http://go.microsoft.com/?LinkId=9394801
    public class MvcApplication : System.Web.HttpApplication
    {
        protected void Application_Start()
        {
            XmlConfigurator.Configure();

            AreaRegistration.RegisterAllAreas();
            RouteConfig.RegisterRoutes(RouteTable.Routes);
            FilterConfig.RegisterGlobalFilters(GlobalFilters.Filters);
            BundleConfig.RegisterBundles(BundleTable.Bundles);

            ControllerBuilder.Current.SetControllerFactory(typeof(ControllerFactory));

            Mapper.AddProfile<PhotosMapping>();
            Mapper.AddProfile<MapMapping>();
            Mapper.AddProfile<AccountMapping>();
            Mapper.AddProfile<BrowseMapping>();

            ObjectFactory.Initialize(x =>
            {
                x.AddRegistry(new RepositoryRegistry());
                x.For<IUnitOfWorkProvider>().HttpContextScoped().Use<NHibernateUnitOfWorkProvider>();
                x.For<IUserSessionProvider>().Singleton().Use<WebUserSessionProvider>();
            });

#if DEBUG
            PhotoStoreProvider.Current = new DefaultPhotoStoreProvider(Server.MapPath(@"~\PhotoStore"));
#else
            PhotoStoreProvider.Current = new BlobStoragePhotoStoreProvider(ConfigurationManager.ConnectionStrings["TmdStorage"].ConnectionString);
#endif
        }

        protected void Application_EndRequest()
        {
            UnitOfWork.Dispose();
        }
    }
}