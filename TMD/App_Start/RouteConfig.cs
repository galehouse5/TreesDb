using System.Web.Mvc;
using System.Web.Routing;

namespace TMD
{
    public class RouteConfig
    {
        public static void RegisterRoutes(RouteCollection routes)
        {
            routes.IgnoreRoute("{resource}.axd/{*pathInfo}");

            routes.MapMvcAttributeRoutes();

            routes.MapRoute("AddPhoto", "Photos/{action}/{id}", new { area = string.Empty, controller = "Photos" }, new { action = "AddTo.+" });
            routes.MapRoute("RemovePhoto", "Photos/{id}/Remove", new { area = string.Empty, controller = "Photos", action = "Remove" });
            routes.MapRoute("PhotoCaption", "Photos/{id}/Caption", new { area = string.Empty, controller = "Photos", action = "Caption" });
            routes.MapRoute("ViewPhoto", "Photos/{id}/{size}", new { area = string.Empty, controller = "Photos", action = "View", size = "Original" });

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

            routes.MapRoute("ExportSpecies", "Export/Species/{botanicalName} ({commonName})", new { area = string.Empty, controller = "Export", action = "Species" });
            routes.MapRoute("ExportSitesSpecies", "Export/Sites/{id}/Species/{botanicalName} ({commonName})", new { area = string.Empty, controller = "Export", action = "SitesSpecies" });
            routes.MapRoute("ExportStatesSpecies", "Export/States/{id}/Species/{botanicalName} ({commonName})", new { area = string.Empty, controller = "Export", action = "StatesSpecies" });
            routes.MapRoute("ExportDefault", "Export/{action}/{id}", new { area = string.Empty, controller = "Export" });

            routes.MapRoute("DefaultWithId", "{controller}/{id}/{action}", new { area = string.Empty, controller = "Main", action = "Index" }, new { id = @"\d+" });
            routes.MapRoute("Default", "{controller}/{action}", new { area = string.Empty, controller = "Main", action = "Index" });

            routes.MapRoute("CatchAll", "{*pathInfo}", new { area = string.Empty, controller = "Error", action = "NotFound" });
        }
    }
}
