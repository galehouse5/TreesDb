using System.Web.Mvc;
using TMD.Model.Locations;
using TMD.Model.Sites;
using TMD.Model.Trees;

namespace TMD.Models.Search
{
    public class ResultModel
    {
        public string Category { get; set; }
        public string Subject { get; set; }
        public string Description { get; set; }
        public string Url { get; set; }

        public static ResultModel From(StateBase state, UrlHelper helper)
        {
            return new ResultModel
            {
                Category = "states",
                Subject = state.Name,
                Description = state.Country.Name,
                Url = helper.Action("StateDetails", "Browse", new { id = state.Id })
            };
        }

        public static ResultModel From(Subsite subsite, UrlHelper helper)
        {
            return new ResultModel
            {
                Category = "sites",
                Subject = subsite.Name,
                Description = string.Format("{0}, {1}", subsite.County, subsite.State),
                Url = helper.Action("SiteDetails", "Browse", new { id = subsite.Site.Id })
            };
        }

        public static ResultModel From(MeasuredSpecies species, UrlHelper helper)
        {
            return new ResultModel
            {
                Category = "species",
                Subject = species.ScientificName,
                Description = species.CommonName,
                Url = helper.Action("SpeciesDetails", "Browse", new
                    {
                        botanicalName = species.ScientificName,
                        commonName = species.CommonName
                    })
            };
        }

        public static ResultModel From(string message, string term, UrlHelper helper)
        {
            return new ResultModel
            {
                Category = "message",
                Subject = string.Empty,
                Description = message,
                Url = helper.Action("Index", "Search", new { term = term })
            };
        }
    }
}