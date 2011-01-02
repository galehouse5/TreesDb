using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.Web.Mvc;
using System.Web.Routing;
using TMD.Model;
using TMD.Extensions;
using TMD.Model.Trips;
using TMD.Model.Locations;
using Recaptcha;
using TMD.Controllers;
using StructureMap;
using TMD.Infrastructure.Repositories;
using TMD.Infrastructure;
using AutoMapper;
using TMD.Mappings;
using TMD.Binders;

namespace TMD
{
    // Note: For instructions on enabling IIS6 or IIS7 classic mode, 
    // visit http://go.microsoft.com/?LinkId=9394801

    public class MvcApplication : System.Web.HttpApplication
    {
        public static void RegisterRoutes(RouteCollection routes)
        {
            routes.IgnoreRoute("{resource}.axd/{*pathInfo}");

            routes.MapRoute("AddPhoto", "Photos/{action}/{id}", new { controller = "Photo" }, new { action = "AddTo.+" });
            routes.MapRoute("RemovePhoto", "Photos/{id}/Remove", new { controller = "Photo", action = "Remove" });
            routes.MapRoute("ViewPhoto", "Photos/{id}/{size}", new { controller = "Photo", action = "View", size = "Original" });

            routes.MapRoute("ViewMapMarkesForImportTree", "Map/ViewMarkersForImport/{id}/Tree/{treeId}", new { controller = "Map", action = "ViewMarkersForImportTree" });
            routes.MapRoute("ViewMapMarkesForImportSubsite", "Map/ViewMarkersForImport/{id}/Subsite/{subsiteId}", new { controller = "Map", action = "ViewMarkersForImportSubsite" });
            routes.MapRoute("ViewMapMarkesForImportSite", "Map/ViewMarkersForImport/{id}/Site/{siteId}", new { controller = "Map", action = "ViewMarkersForImportSite" });

            routes.MapRoute("DefaultWithId", "{controller}/{id}/{action}",
                new { controller = "Main", action = "Index" },
                new { id = @"\d+" });
            routes.MapRoute("Default", "{controller}/{action}",
                new { controller = "Main", action = "Index" });
            //routes.MapRoute("SiteVisits", "trip/{tripdId}/sitevisit/{siteVisitId}/{action}",
            //    new { controller = "Trip", tripId = 0, siteVisitId = 0, action = "Index" });
            //routes.MapRoute("SubsiteVisits", "trip/{tripdId}/sitevisit/{siteVisitId}/subsitevisits/{subsiteVisitId}/{action}",
            //    new { controller = "Trip", tripId = 0, siteVisitId = 0, subsiteVisitId = 0, action = "Index" });
            //routes.MapRoute("TreeMeasurements", "trip/{tripdId}/sitevisit/{siteVisitId}/subsitevisits/{subsiteVisitId}/treemeasurements/{treeMeasurementId}/{action}",
            //    new { controller = "Trip", tripId = 0, siteVisitId = 0, subsiteVisitId = 0, treeMeasurementId = 0, action = "Index" });
            routes.MapRoute("CatchAll", "{*pathInfo}",
                new { controller = "Error", action = "NotFound" });
        }

        protected void Application_Start()
        {
            AreaRegistration.RegisterAllAreas();

            RegisterRoutes(RouteTable.Routes);

            ModelBinders.Binders.DefaultBinder = new DefaultGraphModelBinder();
            ModelBinders.Binders.Add(typeof(Coordinates), new CoordinatesModelBinder());
            ModelBinders.Binders.Add(typeof(State), new StateModelBinder());
            ModelBinders.Binders.Add(typeof(Country), new CountryModelBinder());
            ModelBinders.Binders.Add(typeof(Elevation), new ElevationModelBinder());
            ModelBinders.Binders.Add(typeof(Distance), new DistanceModelBinder());
            ModelBinders.Binders.Add(typeof(Volume), new VolumeModelBinder());
            ModelBinders.Binders.Add(typeof(HeightMeasurements), new HeightMeasurementModelBinder());

            ControllerBuilder.Current.SetControllerFactory(typeof(ControllerFactory));
            
            ModelValidatorProviders.Providers.Clear();
            ModelValidatorProviders.Providers.Add(new NHibernateValidatorModelValidatorProvider());

            Mapper.AddProfile<ImportMapping>();
            Mapper.AddProfile<PhotoMapping>();
            Mapper.AddProfile<MapMapping>();

            log4net.Config.XmlConfigurator.Configure();
            ObjectFactory.Initialize(x =>
            {
                x.AddRegistry(new RepositoryRegistry());
                x.For<IUnitOfWorkProvider>().HttpContextScoped().Use<NHibernateUnitOfWorkProvider>().OnCreation(uow => uow.Initialize());
                x.For<IUserSessionProvider>().Singleton().Use<WebUserSessionProvider>();
            });
        }

        protected void Application_EndRequest()
        {
            UnitOfWork.Dispose();
        }
    }
}