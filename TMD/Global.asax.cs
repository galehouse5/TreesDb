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

namespace TMD
{
    // Note: For instructions on enabling IIS6 or IIS7 classic mode, 
    // visit http://go.microsoft.com/?LinkId=9394801

    public class MvcApplication : System.Web.HttpApplication
    {
        public static void RegisterRoutes(RouteCollection routes)
        {
            routes.IgnoreRoute("{resource}.axd/{*pathInfo}");

            routes.MapRoute(
                "Default",                                              // Route name
                "{controller}/{action}/{id}",                           // URL with parameters
                new { controller = "Main", action = "Index", id = "" }  // Parameter defaults
            );
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

            RecaptchaControlMvc.PublicKey = WebApplicationRegistry.Settings.RecaptchaPublicKey;
            RecaptchaControlMvc.PrivateKey = WebApplicationRegistry.Settings.RecaptchaPrivateKey;
        }

        public override void Init()
        {
            base.Init();
            base.BeginRequest += new EventHandler(BeginRequest_EnforceBrowserCompatibility);
            base.Error += new EventHandler(Error_EnforceUserAuthorization);
        }

        public override void Dispose()
        {
            base.Error -= Error_EnforceUserAuthorization;
            base.BeginRequest -= BeginRequest_EnforceBrowserCompatibility;
            base.Dispose();
        }

        void Error_EnforceUserAuthorization(object sender, EventArgs e)
        {
            if (HttpContext.Current.Error is UserAuthorizationException)
            {
                UserAuthorizationException uae = (UserAuthorizationException)HttpContext.Current.Error;
                HttpContext.Current.ClearError();
                if (uae.NeedsToAuthenticate)
                {
                    HttpContext.Current.Response.Redirect("/Account/Login?ReturnUrl=" + HttpContext.Current.Request.RawUrl, false);
                }
                else
                {
                    HttpContext.Current.RewritePath("/Account/Unauthorized", false);
                    IHttpHandler handler = new MvcHttpHandler();
                    handler.ProcessRequest(HttpContext.Current);
                }
            }
        }

        void BeginRequest_EnforceBrowserCompatibility(object sender, EventArgs e)
        {
            if (Request.Browser.Browser == "Firefox" && Request.Browser.MajorVersion == 3)
            {
                return;
            }
            if (Request.Browser.Browser == "IE" && Request.Browser.MajorVersion == 8)
            {
                return;
            }
            if (Request.Path != "/Main/UntestedBrowser" && string.IsNullOrWhiteSpace(Request.CurrentExecutionFilePathExtension))
            {
                HttpContext.Current.RewritePath("/Main/UntestedBrowser");
            }            
        }
    }
}