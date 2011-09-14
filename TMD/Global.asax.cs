using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.Web.Mvc;
using System.Web.Routing;
using TMD.Model;
using TMD.Model.Logging;
using TMD.Infrastructure.Repositories;
using TMD.Mappings;
using AutoMapper;
using TMD.Extensions;
using TMD.Binders;
using TMD.Infrastructure;
using StructureMap;

namespace TMD
{
    // Note: For instructions on enabling IIS6 or IIS7 classic mode, 
    // visit http://go.microsoft.com/?LinkId=9394801

    public class MvcApplication : System.Web.HttpApplication
    {
        public static void RegisterGlobalFilters(GlobalFilterCollection filters)
        {
            filters.Add(new HandleErrorAttribute());
        }

        public static void RegisterRoutes(RouteCollection routes)
        {
            routes.IgnoreRoute("{resource}.axd/{*pathInfo}");

            //routes.MapRoute(
            //    "Default", // Route name
            //    "{controller}/{action}/{id}", // URL with parameters
            //    new { controller = "Home", action = "Index", id = UrlParameter.Optional } // Parameter defaults
            //);

            routes.MapRoute("AddPhoto", "Photos/{action}/{id}", new { controller = "Photos" }, new { action = "AddTo.+" });
            routes.MapRoute("RemovePhoto", "Photos/{id}/Remove", new { controller = "Photos", action = "Remove" });
            routes.MapRoute("PhotoCaption", "Photos/{id}/Caption", new { controller = "Photos", action = "Caption" });
            routes.MapRoute("ViewPhoto", "Photos/{id}/{size}", new { controller = "Photos", action = "View", size = "Original" });

            routes.MapRoute("ViewMapMarkesForImportTree", "Map/ViewMarkersForImport/{id}/Tree/{treeId}", new { controller = "Map", action = "ViewMarkersForImportTree" });
            routes.MapRoute("ViewMapMarkesForImportSubsite", "Map/ViewMarkersForImport/{id}/Subsite/{subsiteId}", new { controller = "Map", action = "ViewMarkersForImportSubsite" });
            routes.MapRoute("ViewMapMarkesForImportSite", "Map/ViewMarkersForImport/{id}/Site/{siteId}", new { controller = "Map", action = "ViewMarkersForImportSite" });
            routes.MapRoute("Map", "Map/{action}", new { controller = "Map", action = "Index" });

            routes.MapRoute("CompleteAccountPasswordAssistance", "Account/{token}/CompletePasswordAssistance", new { controller = "Account", action = "CompletePasswordAssistance" });
            routes.MapRoute("CompleteAccountRegistration", "Account/{token}/CompleteRegistration", new { controller = "Account", action = "CompleteRegistration" });
            routes.MapRoute("Account", "Account/{action}", new { controller = "Account", action = "Index" });

            routes.MapRoute("BrowseStateSpeciesDetails", "Browse/States/{stateId}/Species/{botanicalName}-{commonName}/Details", new { controller = "Browse", action = "SpeciesDetails" });
            routes.MapRoute("BrowseSiteSpeciesDetails", "Browse/Sites/{siteId}/Species/{botanicalName}-{commonName}/Details", new { controller = "Browse", action = "SpeciesDetails" });
            routes.MapRoute("BrowseSpeciesDetails", "Browse/Species/{botanicalName}-{commonName}/Details", new { controller = "Browse", action = "SpeciesDetails" });
            routes.MapRoute("BrowseTreeDetails", "Browse/Trees/{id}/Details", new { controller = "Browse", action = "TreeDetails" });
            routes.MapRoute("BrowseStateDetails", "Browse/States/{id}/Details", new { controller = "Browse", action = "StateDetails" });
            routes.MapRoute("BrowseSiteDetails", "Browse/Sites/{id}/Details", new { controller = "Browse", action = "SiteDetails" });
            routes.MapRoute("BrowseSpecies", "Browse/Species", new { controller = "Browse", action = "Species" });
            routes.MapRoute("BrowseLocations", "Browse/Locations", new { controller = "Browse", action = "Locations" });
            routes.MapRoute("Browse", "Browse", new { controller = "Browse", action = "Index" });

            routes.MapRoute("Main", "Main/{action}", new { controller = "Main", action = "Index" });

            routes.MapRoute("ImportIndex", "Import", new { controller = "Import", action = "Index" });
            routes.MapRoute("ImportNew", "Import/New", new { controller = "Import", action = "New" });
            routes.MapRoute("ImportHistory", "Import/History", new { controller = "Import", action = "History" });

            routes.MapRoute("ExportSpecies", "Export/Species/{botanicalName}-{commonName}", new { controller = "Export", action = "Species" });
            routes.MapRoute("ExportSitesSpecies", "Export/Sites/{id}/Species/{botanicalName}", new { controller = "Export", action = "SitesSpecies" });
            routes.MapRoute("ExportStatesSpecies", "Export/States/{id}/Species/{botanicalName}", new { controller = "Export", action = "StatesSpecies" });
            routes.MapRoute("ExportDefault", "Export/{action}/{id}", new { controller = "Export" });

            routes.MapRoute("DefaultWithId", "{controller}/{id}/{action}", new { controller = "Main", action = "Index" }, new { id = @"\d+" });
            routes.MapRoute("Default", "{controller}/{action}", new { controller = "Main", action = "Index" });

            routes.MapRoute("CatchAll", "{*pathInfo}", new { controller = "Error", action = "NotFound" });
        }

        protected void Application_Start()
        {
            AreaRegistration.RegisterAllAreas();

            RegisterGlobalFilters(GlobalFilters.Filters);
            RegisterRoutes(RouteTable.Routes);

            //ModelBinders.Binders.DefaultBinder = new DefaultGraphModelBinder();
            ModelBinders.Binders.Add(typeof(IUnitOfWork), new NullModelBinder());
            new ValueObjectBinders().Bind(ModelBinders.Binders);

            ControllerBuilder.Current.SetControllerFactory(typeof(ControllerFactory));

            Mapper.AddProfile<ImportMapping>();
            Mapper.AddProfile<PhotosMapping>();
            Mapper.AddProfile<MapMapping>();
            Mapper.AddProfile<AccountMapping>();
            Mapper.AddProfile<BrowseMapping>();

            log4net.Config.XmlConfigurator.Configure();
            ObjectFactory.Initialize(x =>
            {
                x.AddRegistry(new RepositoryRegistry());
                x.For<IUnitOfWorkProvider>().HttpContextScoped().Use<NHibernateUnitOfWorkProvider>();
                x.For<IUserSessionProvider>().Singleton().Use<WebUserSessionProvider>();
                x.For<ILogProvider>().Singleton().Use<Log4NetLogProvider>()
                    .OnCreation(lp =>
                    {
                        lp.AddContextProperty("Request.Url", () => HttpContext.Current.Request.Url.ToString());
                        lp.AddContextProperty("Request.Path", () => HttpContext.Current.Request.Path);
                        lp.AddContextProperty("Request.UserHostAddress", () => HttpContext.Current.Request.UserHostAddress);
                        lp.AddContextProperty("Request.User", () => HttpContext.Current.User.Identity.Name);
                        lp.AddContextProperty("Request.IsAuthenticated", () => HttpContext.Current.User.Identity.IsAuthenticated.ToString());
                        lp.AddContextProperty("Application.Path", () => HttpContext.Current.Request.PhysicalApplicationPath);
                        lp.AddContextProperty("Application.Machine", () => Environment.MachineName);
                    });
            });
        }

        protected void Application_EndRequest()
        {
            UnitOfWork.Dispose();
        }
    }
}