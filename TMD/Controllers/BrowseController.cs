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
using TMD.Model.Locations;

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
            if (tree == null) { return new NotFoundResult(); }
            var orderedMeasurements = from measurement in tree.Measurements
                                      orderby measurement.Measured descending
                                      select measurement;
            var measurementsWithPhotos = from measurement in tree.Measurements
                                         orderby measurement.Measured descending
                                         where measurement.Photos.Count > 0
                                         select measurement;
            var locationModel = Mapper.Map<Tree, BrowseTreeLocationModel>(tree);
            Mapper.Map(tree.Subsite, locationModel);
            Mapper.Map(tree.Subsite.Site, locationModel);
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
        public virtual ActionResult SiteDetails(int id)
        {
            var site = Repositories.Sites.FindById(id);
            if (site == null) { return new NotFoundResult(); }
            var siteVisits = from visit in site.Visits
                             orderby visit.Visited descending
                             select visit;
            var subsite = site.Subsites[0];
            var visitsWithPhotos = from visit in subsite.Visits
                                   orderby visit.Visited descending
                                   where visit.Photos.Count > 0
                                   select visit;
            var species = Repositories.Trees.ListMeasuredSpeciesBySubsiteId(subsite.Id);
            var model = new BrowseSiteModel
            {
                Id = id,
                Details = Mapper.Map<Subsite, BrowseSubsiteDetailsModel>(subsite),
                Location = Mapper.Map<Subsite, BrowseSubsiteLocationModel>(subsite),
                PhotoSummaries = Mapper.Map<IEnumerable<SubsiteVisit>, IList<BrowsePhotoSumaryModel>>(visitsWithPhotos),
                Species = species,
                Visits = Mapper.Map<IEnumerable<SiteVisit>, IList<BrowseSiteVisitModel>>(siteVisits)
            };
            return View(model);
        }

        [DefaultReturnUrl]
        public virtual ActionResult SpeciesDetails(string botanicalName, string commonName, int? siteId = null, int? stateId = null)
        {
            GlobalMeasuredSpecies globalSpecies = Repositories.Trees.FindMeasuredSpeciesByName(botanicalName, commonName);
            if (globalSpecies == null) { return new NotFoundResult(); }
            BrowseSpeciesModel model = new BrowseSpeciesModel
            {
                GlobalDetails = Mapper.Map<GlobalMeasuredSpecies, BrowseSpeciesDetailsModel>(globalSpecies),
                StatesContainingSpecies = Repositories.Trees.ListMeasuredSpeciesForStatesByName(botanicalName, commonName)
            };
            if (siteId.HasValue)
            {
                SiteMeasuredSpecies siteSpecies = Repositories.Trees.FindMeasuredSpeciesByNameAndSiteId(botanicalName, commonName, siteId.Value);
                if (siteSpecies == null) { return new NotFoundResult(); }
                model.SiteDetails = Mapper.Map<SiteMeasuredSpecies, BrowseSpeciesSiteDetailsModel>(siteSpecies);
                model.TreesOfSpeciesContainedBySite = Repositories.Trees.ListByNameAndSiteId(botanicalName, commonName, siteId.Value);
                stateId = siteSpecies.Site.Subsites[0].State.Id;
            }
            if (stateId.HasValue)
            {
                StateMeasuredSpecies stateSpecies = Repositories.Trees.FindMeasuredSpeciesByNameAndStateId(botanicalName, commonName, stateId.Value);
                if (stateSpecies == null) { return new NotFoundResult(); }
                model.StateDetails = Mapper.Map<StateMeasuredSpecies, BrowseSpeciesStateDetailsModel>(stateSpecies);
                model.SitesInStateContainingSpecies = Repositories.Trees.ListMeasuredSpeciesForSitesByNameAndStateId(botanicalName, commonName, stateId.Value);
            }
            return View(model);
        }

        [DefaultReturnUrl]
        public virtual ActionResult StateDetails(int id)
        {
            var state = Repositories.Locations.FindVisitedStateById(id);
            if (state == null) { return new NotFoundResult(); }
            var model = Mapper.Map<VisitedState, BrowseStateModel>(state);
            model.Species = Repositories.Trees.ListMeasuredSpeciesByStateId(state.Id);
            model.Subsites = Repositories.Sites.FindSubsitesByStateId(state.Id);
            return View(model);
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
