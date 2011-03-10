using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.Web.Mvc;
using TMD.Models;
using TMD.Model;
using AutoMapper;
using TMD.Model.Trees;
using TMD.Extensions;
using TMD.Model.Sites;

namespace TMD.Controllers
{
    public partial class BrowseController : ControllerBase
    {
        [ChildActionOnly]
        public virtual ActionResult MenuWidget(bool isSelected)
        {
            return PartialView(new BrowseMenuWidgetModel
            {
                IsSelected = isSelected
            });
        }

        [DefaultReturnUrl]
        public virtual ActionResult TreeDetails(int id)
        {
            var tree = Repositories.Trees.FindById(id);
            var site = Repositories.Sites.FindSiteContainingTree(id);
            var subsite = site.Subsites.Where(ss => ss.Trees.Contains(tree)).First();
            var orderedMeasurements = from measurement in tree.Measurements
                                      orderby measurement.Measured descending
                                      select measurement;
            var measurementsWithPhotos = from measurement in tree.Measurements
                                         orderby measurement.Measured descending
                                         where measurement.Photos.Count > 0
                                         select measurement;
            var locationModel = Mapper.Map<Tree, BrowseTreeLocationModel>(tree);
            Mapper.Map(site, locationModel);
            Mapper.Map(subsite, locationModel);
            var model = new BrowseTreeModel
            {
                Details = Mapper.Map<Tree, BrowseTreeDetailsModel>(tree),
                MeasurementDetails = Mapper.Map<IEnumerable<Measurement>, IList<BrowseTreeDetailsModel>>(orderedMeasurements),
                PhotoSummaries = Mapper.Map<IEnumerable<Measurement>, IList<BrowsePhotoSumaryModel>>(measurementsWithPhotos),
                Location = locationModel
            };
            return View(model);
        }

        [DefaultReturnUrl]
        public virtual ActionResult MeasurementDetails(int id)
        {
            throw new NotImplementedException();
        }

        [DefaultReturnUrl]
        public virtual ActionResult SiteDetails(int id)
        {
            var site = Repositories.Sites.FindById(id);
            var subsite = site.Subsites[0];
            var visitsWithPhotos = from visit in subsite.Visits
                                   orderby visit.Visited descending
                                   where visit.Photos.Count > 0
                                   select visit;
            var species = Repositories.Trees.FindSubsiteMeasuredSpeciesBySubsiteId(subsite.Id);
            var model = new BrowseSubsiteModel
            {
                Details = Mapper.Map<Subsite, BrowseSubsiteDetailsModel>(subsite),
                Location = Mapper.Map<Subsite, BrowseSubsiteLocationModel>(subsite),
                PhotoSummaries = Mapper.Map<IEnumerable<SubsiteVisit>, IList<BrowsePhotoSumaryModel>>(visitsWithPhotos),
                Species = species
            };
            return View(model);
        }

        [DefaultReturnUrl]
        public virtual ActionResult SpeciesDetails(int id)
        {
            var species = Repositories.Trees.FindMeasuredSpeciesById<MeasuredSpecies>(id);
            var states = Repositories.Trees.FindStateMeasuredSpeciesByBotanicalName(species.ScientificName);
            var model = Mapper.Map<MeasuredSpecies, BrowseSpeciesModel>(species);
            Mapper.Map(states, model);
            return View(model);
        }

        [DefaultReturnUrl]
        public virtual ActionResult StateDetails(int id)
        {
            throw new NotImplementedException();
        }

        [DefaultReturnUrl]
        public virtual ActionResult Species(int? page = null, string sort = null, bool? sortAsc = null, 
            string botanicalNameFilter = "", string commonNameFilter = "")
        {
            SpeciesBrowser browser = new SpeciesBrowser
            {
                PageIndex = page ?? 0,
                PageSize = 50,
                BotanicalNameFilter = botanicalNameFilter, CommonNameFilter = commonNameFilter,
                SortAscending = !sortAsc.HasValue || sortAsc.Value,
                SortProperty = "BotanicalName".Equals(sort) ? SpeciesBrowser.Property.BotanicalName
                    : "CommonName".Equals(sort) ? SpeciesBrowser.Property.CommonName
                    : SpeciesBrowser.Property.BotanicalName
            };
            var model = Repositories.Trees.ListAllMeasuredSpecies<GlobalMeasuredSpecies>(browser);
            return View(model);
        }

        [DefaultReturnUrl]
        public virtual ActionResult Locations(int? page = null, string sort = null, bool? sortAsc = null,
            string stateFilter = "", string siteFilter = "", string subsiteFilter = "")
        {
            SubsiteBrowser browser = new SubsiteBrowser
            {
                PageIndex = page ?? 0,
                PageSize = 50,
                StateFilter = stateFilter, SiteFilter = siteFilter, SubsiteFilter = subsiteFilter,
                SortAscending = !sortAsc.HasValue || sortAsc.Value,
                SortProperty = "State".Equals(sort) ? SubsiteBrowser.Property.State
                    : "Site".Equals(sort) ? SubsiteBrowser.Property.Site
                    : "Subsite".Equals(sort) ? SubsiteBrowser.Property.Subsite
                    : SubsiteBrowser.Property.State
            };
            var model = Repositories.Sites.ListAllSubsites(browser);
            return View(model);
        }
        
        [DefaultReturnUrl]
        public virtual ActionResult Index(int? speciesPage = null, string speciesSort = null, bool? speciesSortAsc = null, 
            string speciesBotanicalNameFilter = "", string speciesCommonNameFilter = "",
            int? locationPage = null, string locationSort = null, bool? locationSortAsc = null,
            string locationStateFilter = "", string locationSiteFilter = "", string locationSubsiteFilter = "")
        {
            SpeciesBrowser speciesBrowser = new SpeciesBrowser
            {
                PageIndex = speciesPage ?? 0,
                PageSize = 25,
                BotanicalNameFilter = speciesBotanicalNameFilter, CommonNameFilter = speciesCommonNameFilter,
                SortAscending = !speciesSortAsc.HasValue || speciesSortAsc.Value,
                SortProperty = "BotanicalName".Equals(speciesSort) ? SpeciesBrowser.Property.BotanicalName
                    : "CommonName".Equals(speciesSort) ? SpeciesBrowser.Property.CommonName
                    : SpeciesBrowser.Property.BotanicalName
            };
            var speciesModel = Repositories.Trees.ListAllMeasuredSpecies<GlobalMeasuredSpecies>(speciesBrowser);
            SubsiteBrowser locationsBrowser = new SubsiteBrowser
            {
                PageIndex = locationPage ?? 0,
                PageSize = 25,
                StateFilter = locationStateFilter, SiteFilter = locationSiteFilter, SubsiteFilter = locationSubsiteFilter,
                SortAscending = !locationSortAsc.HasValue || locationSortAsc.Value,
                SortProperty = "State".Equals(locationSort) ? SubsiteBrowser.Property.State
                    : "Site".Equals(locationSort) ? SubsiteBrowser.Property.Site
                    : "Subsite".Equals(locationSort) ? SubsiteBrowser.Property.Subsite
                    : SubsiteBrowser.Property.State
            };
            var locationsModel = Repositories.Sites.ListAllSubsites(locationsBrowser);
            return View(new Tuple<EntityPage<GlobalMeasuredSpecies>, EntityPage<Subsite>>(speciesModel, locationsModel));
        }
    }
}
