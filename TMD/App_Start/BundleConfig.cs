using System.Web.Optimization;

namespace TMD
{
    public class BundleConfig
    {
        // For more information on Bundling, visit http://go.microsoft.com/fwlink/?LinkId=254725
        public static void RegisterBundles(BundleCollection bundles)
        {
            // js bundles
            bundles.Add(new ScriptBundle("~/js/Shared.js").Include(
                "~/js/Shared/*.js",
                "~/js/Search/menu-widget.js",
                "~/js/slate/slate.js",
                "~/js/slate/slate.portlet.js"));

            bundles.Add(new ScriptBundle("~/js/Import.js").Include(
                "~/js/Import/Sites.js",
                "~/js/Import/Trees.js"));

            bundles.Add(new ScriptBundle("~/js/Map.js").Include(
                "~/js/Map/CoordinatePicker.js",
                "~/js/Map/Coordinates.js",
                "~/js/Map/Extensions.js",
                "~/js/Map/Widgets.js"));

            bundles.Add(new ScriptBundle("~/js/Plugins.js").Include(
                "~/js/jquery/facebox.js",
                "~/js/misc/excanvas.js",
                "~/js/jquery/jquery.dataTables.js",
                "~/js/jquery/jquery.quicksearch.js",
                "~/js/jquery/jquery.tablesorter.js",
                "~/js/jquery/jquery.tipsy.js",
                "~/js/jquery/jquery.uniform.js",
                "~/js/jquery/jquery.visualize.js",
                "~/js/misc/upclick.js",
                "~/js/jquery/jquery.placeholder-1.1.9.js"));

            // css bundles
            bundles.Add(new StyleBundle("~/css/Shared.css").Include(
                "~/css/screen.css",
                "~/css/plugin-dataTables.css",
                "~/css/plugin-facebox.css",
                "~/css/plugin-jquery.visualize.css",
                "~/css/plugin-tipsy.css",
                "~/css/plugin-uniform.default.css",
                "~/css/plugin-jquery.placeholder.css",
                "~/css/custom.css",
                "~/css/theme-screen.css",
                "~/css/theme-plugin.css",
                "~/css/theme-shared.css"));

            bundles.Add(new StyleBundle("~/css/LoginOnly.css").Include(
                "~/css/login.css",
                "~/css/theme-login.css"));
        }
    }
}