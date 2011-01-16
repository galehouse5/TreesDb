using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.Web.Mvc;
using System.Web.Routing;
using TMD.Model;
using TMD.Extensions;
using TMD.Model.Imports;
using TMD.Model.Locations;
using Recaptcha;
using TMD.Controllers;
using StructureMap;
using TMD.Infrastructure.Repositories;
using TMD.Infrastructure;
using AutoMapper;
using TMD.Mappings;
using TMD.Binders;
using TMD.Model.Logging;

namespace TMD
{
    // Note: For instructions on enabling IIS6 or IIS7 classic mode, 
    // visit http://go.microsoft.com/?LinkId=9394801

    public class MvcApplication : System.Web.HttpApplication
    {
        public static void RegisterRoutes(RouteCollection routes)
        {
            routes.IgnoreRoute("{resource}.axd/{*pathInfo}");

            routes.MapRoute("AddPhoto", "Photos/{action}/{id}", new { controller = "Photos" }, new { action = "AddTo.+" });
            routes.MapRoute("RemovePhoto", "Photos/{id}/Remove", new { controller = "Photos", action = "Remove" });
            routes.MapRoute("ViewPhoto", "Photos/{id}/{size}", new { controller = "Photos", action = "View", size = "Original" });

            routes.MapRoute("ViewMapMarkesForImportTree", "Map/ViewMarkersForImport/{id}/Tree/{treeId}", new { controller = "Map", action = "ViewMarkersForImportTree" });
            routes.MapRoute("ViewMapMarkesForImportSubsite", "Map/ViewMarkersForImport/{id}/Subsite/{subsiteId}", new { controller = "Map", action = "ViewMarkersForImportSubsite" });
            routes.MapRoute("ViewMapMarkesForImportSite", "Map/ViewMarkersForImport/{id}/Site/{siteId}", new { controller = "Map", action = "ViewMarkersForImportSite" });
            routes.MapRoute("Map", "Map/{action}", new { controller = "Map", action = "Index" });

            routes.MapRoute("CompleteAccountPasswordAssistance", "Account/{token}/CompletePasswordAssistance", new { controller = "Account", action = "CompletePasswordAssistance" });
            routes.MapRoute("CompleteAccountRegistration", "Account/{token}/CompleteRegistration", new { controller = "Account", action = "CompleteRegistration" });
            routes.MapRoute("Account", "Account/{action}", new { controller = "Account", action = "Index" });

            routes.MapRoute("Main", "Main/{action}", new { controller = "Main", action = "Index" });

            routes.MapRoute("ImportIndex", "Import", new { controller = "Import", action = "Index" });
            routes.MapRoute("ImportNew", "Import/New", new { controller = "Import", action = "New" });
            routes.MapRoute("ImportHistory", "Import/History", new { controller = "Import", action = "History" });

            routes.MapRoute("DefaultWithId", "{controller}/{id}/{action}", new { controller = "Main", action = "Index" }, new { id = @"\d+" });
            routes.MapRoute("Default", "{controller}/{action}", new { controller = "Main", action = "Index" });

            routes.MapRoute("CatchAll", "{*pathInfo}", new { controller = "Error", action = "NotFound" });
        }

        protected void Application_Start()
        {
            AreaRegistration.RegisterAllAreas();

            RegisterRoutes(RouteTable.Routes);

            ModelBinders.Binders.DefaultBinder = new DefaultGraphModelBinder();
            ModelBinders.Binders.Add(typeof(IUnitOfWork), new NullModelBinder());
            new ValueObjectBinders().Bind(ModelBinders.Binders);

            ControllerBuilder.Current.SetControllerFactory(typeof(ControllerFactory));
            
            ModelValidatorProviders.Providers.Clear();
            ModelValidatorProviders.Providers.Add(new NHibernateValidatorModelValidatorProvider());

            Mapper.AddProfile<ImportMapping>();
            Mapper.AddProfile<PhotoMapping>();
            Mapper.AddProfile<MapMapping>();
            Mapper.AddProfile<AccountMapping>();

            log4net.Config.XmlConfigurator.Configure();
            ObjectFactory.Initialize(x =>
            {
                x.AddRegistry(new RepositoryRegistry());
                x.For<IUnitOfWorkProvider>().HttpContextScoped().Use<NHibernateUnitOfWorkProvider>();
                x.For<IUserSessionProvider>().Singleton().Use<WebUserSessionProvider>();
                x.For<ILogProvider>().Singleton().Use<Log4NetLogProvider>();
            });
        }

        protected void Application_EndRequest()
        {
            UnitOfWork.Dispose();
        }
    }
}