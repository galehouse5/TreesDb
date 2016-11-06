using AutoMapper;
using log4net.Config;
using StructureMap;
using System.Configuration;
using System.Web.Mvc;
using System.Web.Optimization;
using System.Web.Routing;
using Tmd.WindowsAzure;
using TMD.Binders;
using TMD.Filters;
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
        public static void RegisterGlobalFilters(GlobalFilterCollection filters)
        {
            filters.Add(new LogExceptionFilter());
            filters.Add(new HandleExceptionFilter());
            filters.Add(new ValidateInputAttribute(enableValidation: false));
        }

        public static void RegisterRoutes(RouteCollection routes)
        {
            routes.IgnoreRoute("{resource}.axd/{*pathInfo}");

            //routes.MapRoute(
            //    "Default", // Route name
            //    "{controller}/{action}/{id}", // URL with parameters
            //    new { controller = "Home", action = "Index", id = UrlParameter.Optional } // Parameter defaults
            //);

            routes.MapRoute("AddPhoto", "Photos/{action}/{id}", new { area = string.Empty, controller = "Photos" }, new { action = "AddTo.+" });
            routes.MapRoute("RemovePhoto", "Photos/{id}/Remove", new { area = string.Empty, controller = "Photos", action = "Remove" });
            routes.MapRoute("PhotoCaption", "Photos/{id}/Caption", new { area = string.Empty, controller = "Photos", action = "Caption" });
            routes.MapRoute("ViewPhoto", "Photos/{id}/{size}", new { area = string.Empty, controller = "Photos", action = "View", size = "Original" });

            routes.MapRoute("ViewMapMarkesForImportTree", "Map/ViewMarkersForImport/{id}/Tree/{treeId}", new { area = string.Empty, controller = "Map", action = "ViewMarkersForImportTree" });
            routes.MapRoute("ViewMapMarkesForImportSubsite", "Map/ViewMarkersForImport/{id}/Subsite/{subsiteId}", new { area = string.Empty, controller = "Map", action = "ViewMarkersForImportSubsite" });
            routes.MapRoute("ViewMapMarkesForImportSite", "Map/ViewMarkersForImport/{id}/Site/{siteId}", new { area = string.Empty, controller = "Map", action = "ViewMarkersForImportSite" });
            routes.MapRoute("Map", "Map/{action}", new { area = string.Empty, controller = "Map", action = "Index" });

            routes.MapRoute("CompleteAccountPasswordAssistance", "Account/{token}/CompletePasswordAssistance", new { area = string.Empty, controller = "Account", action = "CompletePasswordAssistance" });
            routes.MapRoute("CompleteAccountRegistration", "Account/{token}/CompleteRegistration", new { area = string.Empty, controller = "Account", action = "CompleteRegistration" });
            routes.MapRoute("Account", "Account/{action}", new { area = string.Empty, controller = "Account", action = "Index" });

            routes.MapRoute("BrowseStateSpeciesDetails", "Browse/States/{stateId}/Species/{botanicalName} ({commonName})/Details", new { area = string.Empty, controller = "Browse", action = "SpeciesDetails" });
            routes.MapRoute("BrowseSiteSpeciesDetails", "Browse/Sites/{siteId}/Species/{botanicalName} ({commonName})/Details", new { area = string.Empty, controller = "Browse", action = "SpeciesDetails" });
            routes.MapRoute("BrowseSpeciesDetails", "Browse/Species/{botanicalName} ({commonName})/Details", new { area = string.Empty, controller = "Browse", action = "SpeciesDetails" });
            routes.MapRoute("BrowseTreeDetails", "Browse/Trees/{id}/Details", new { area = string.Empty, controller = "Browse", action = "TreeDetails" });
            routes.MapRoute("BrowseStateDetails", "Browse/States/{id}/Details", new { area = string.Empty, controller = "Browse", action = "StateDetails" });
            routes.MapRoute("BrowseSiteDetails", "Browse/Sites/{id}/Details", new { area = string.Empty, controller = "Browse", action = "SiteDetails" });
            routes.MapRoute("BrowseSpecies", "Browse/Species", new { area = string.Empty, controller = "Browse", action = "Species" });
            routes.MapRoute("BrowseLocations", "Browse/Locations", new { area = string.Empty, controller = "Browse", action = "Locations" });
            routes.MapRoute("Browse", "Browse", new { area = string.Empty, controller = "Browse", action = "Index" });

            routes.MapRoute("Main", "Main/{action}", new { area = string.Empty, controller = "Main", action = "Index" });

            routes.MapRoute("ImportIndex", "Import", new { area = string.Empty, controller = "Import", action = "Index" });
            routes.MapRoute("ImportNew", "Import/New", new { area = string.Empty, controller = "Import", action = "New" });
            routes.MapRoute("ImportHistory", "Import/History", new { area = string.Empty, controller = "Import", action = "History" });

            routes.MapRoute("ExportSpecies", "Export/Species/{botanicalName} ({commonName})", new { area = string.Empty, controller = "Export", action = "Species" });
            routes.MapRoute("ExportSitesSpecies", "Export/Sites/{id}/Species/{botanicalName} ({commonName})", new { area = string.Empty, controller = "Export", action = "SitesSpecies" });
            routes.MapRoute("ExportStatesSpecies", "Export/States/{id}/Species/{botanicalName} ({commonName})", new { area = string.Empty, controller = "Export", action = "StatesSpecies" });
            routes.MapRoute("ExportDefault", "Export/{action}/{id}", new { area = string.Empty, controller = "Export" });

            routes.MapRoute("DefaultWithId", "{controller}/{id}/{action}", new { area = string.Empty, controller = "Main", action = "Index" }, new { id = @"\d+" });
            routes.MapRoute("Default", "{controller}/{action}", new { area = string.Empty, controller = "Main", action = "Index" });

            routes.MapRoute("CatchAll", "{*pathInfo}", new { area = string.Empty, controller = "Error", action = "NotFound" });
        }

        protected void Application_Start()
        {
            XmlConfigurator.Configure();

            AreaRegistration.RegisterAllAreas();

            RegisterGlobalFilters(GlobalFilters.Filters);
            RegisterRoutes(RouteTable.Routes);
            BundleConfig.RegisterBundles(BundleTable.Bundles);

            //ModelBinders.Binders.DefaultBinder = new DefaultGraphModelBinder();
            ModelBinders.Binders.Add(typeof(IUnitOfWork), new NullModelBinder());
            new ValueObjectBinders().Bind(ModelBinders.Binders);

            ControllerBuilder.Current.SetControllerFactory(typeof(ControllerFactory));

            Mapper.AddProfile<ImportMapping>();
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