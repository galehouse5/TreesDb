using AutoMapper;
using log4net.Config;
using System.Configuration;
using System.Web.Mvc;
using System.Web.Optimization;
using System.Web.Routing;
using Tmd.WindowsAzure;
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
            StructureMapConfig.RegisterContainer();

            AreaRegistration.RegisterAllAreas();
            RouteConfig.RegisterRoutes(RouteTable.Routes);
            FilterConfig.RegisterGlobalFilters(GlobalFilters.Filters);
            BundleConfig.RegisterBundles(BundleTable.Bundles);

            Mapper.AddProfile<PhotosMapping>();
            Mapper.AddProfile<MapMapping>();
            Mapper.AddProfile<AccountMapping>();
            Mapper.AddProfile<BrowseMapping>();

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