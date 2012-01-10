﻿using System;
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
    [CheckBrowserCompatibilityFilterAttribute]
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
        public virtual ActionResult SiteDetails(int id,
            int? subsiteSpeciesPage = null, string subsiteSpeciesSort = null, bool? subsiteSpeciesSortAsc = null)
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
            var allSubsiteSpecies = Repositories.Trees.ListMeasuredSpeciesBySubsiteId(subsite.Id);
            var subsiteSpeciesDataSource = allSubsiteSpecies.SortAndPageInMemory(
                column =>
                {
                    if ("BotanicalName".Equals(column)) { return species => species.ScientificName; }
                    if ("CommonName".Equals(column)) { return species => species.CommonName; }
                    if ("MaxHeight".Equals(column)) { return species => species.MaxHeight; }
                    if ("MaxGirth".Equals(column)) { return species => species.MaxGirth; }
                    if ("MaxCrownSpread".Equals(column)) { return species => species.MaxCrownSpread; }
                    throw new NotImplementedException();
                },
                subsiteSpeciesSort, subsiteSpeciesSortAsc, subsiteSpeciesPage, 10);
            var model = new BrowseSiteModel
            {
                Id = id,
                Details = Mapper.Map<Subsite, BrowseSubsiteDetailsModel>(subsite),
                Location = Mapper.Map<Subsite, BrowseSubsiteLocationModel>(subsite),
                PhotoSummaries = Mapper.Map<IEnumerable<SubsiteVisit>, IList<BrowsePhotoSumaryModel>>(visitsWithPhotos),
                Visits = Mapper.Map<IEnumerable<SiteVisit>, IList<BrowseSiteVisitModel>>(siteVisits),
                SubsiteSpeciesPage = subsiteSpeciesDataSource,
                SubsiteSpeciesTotalCount = subsiteSpeciesDataSource.TotalRowCount
            };
            return View(model);
        }

        [DefaultReturnUrl]
        public virtual ActionResult SpeciesDetails(string botanicalName, string commonName, int? siteId = null, int? stateId = null,
            int? stateSpeciesPage = null, string stateSpeciesSort = null, bool? stateSpeciesSortAsc = null,
            int? treesPage = null, string treesSort = null, bool? treesSortAsc = null,
            int? siteSpeciesPage = null, string siteSpeciesSort = null, bool? siteSpeciesSortAsc = null)
        {
            GlobalMeasuredSpecies globalSpecies = Repositories.Trees.FindMeasuredSpeciesByName(botanicalName, commonName);
            if (globalSpecies == null) { return new NotFoundResult(); }
            BrowseSpeciesModel model = new BrowseSpeciesModel
            {
                GlobalDetails = Mapper.Map<GlobalMeasuredSpecies, BrowseSpeciesDetailsModel>(globalSpecies)
            };
            IList<StateMeasuredSpecies> allStateSpecies = Repositories.Trees.ListMeasuredSpeciesForStatesByName(botanicalName, commonName);
            var stateSpeciesDataSource = allStateSpecies.SortAndPageInMemory(
                column =>
                {
                    if ("State".Equals(column)) { return species => species.State.Name; }
                    if ("MaxHeight".Equals(column)) { return species => species.MaxHeight; }
                    if ("MaxGirth".Equals(column)) { return species => species.MaxGirth; }
                    if ("MaxCrownSpread".Equals(column)) { return species => species.MaxCrownSpread; }
                    throw new NotImplementedException();
                },
                stateSpeciesSort, stateSpeciesSortAsc, stateSpeciesPage, 10);
            model.StateSpeciesPage = stateSpeciesDataSource;
            model.StateSpeciesTotalCount = stateSpeciesDataSource.TotalRowCount;
            if (siteId.HasValue)
            {
                SiteMeasuredSpecies siteSpecies = Repositories.Trees.FindMeasuredSpeciesByNameAndSiteId(botanicalName, commonName, siteId.Value);
                if (siteSpecies == null) { return new NotFoundResult(); }
                stateId = siteSpecies.Site.Subsites[0].State.Id;
                model.SiteDetails = Mapper.Map<SiteMeasuredSpecies, BrowseSpeciesSiteDetailsModel>(siteSpecies);
                IList<Tree> allTrees = Repositories.Trees.ListByNameAndSiteId(botanicalName, commonName, siteId.Value);
                var treesDataSource = allTrees.SortAndPageInMemory(
                    column =>
                    {
                        if ("Height".Equals(column)) { return tree => tree.Height; }
                        if ("Girth".Equals(column)) { return tree => tree.Girth; }
                        if ("CrownSpread".Equals(column)) { return tree => tree.CrownSpread; }
                        throw new NotImplementedException();
                    },
                    treesSort, treesSortAsc, treesPage, 10);
                model.TreesPage = treesDataSource;
                model.TreesTotalCount = treesDataSource.TotalRowCount;
            }
            if (stateId.HasValue)
            {
                StateMeasuredSpecies stateSpecies = Repositories.Trees.FindMeasuredSpeciesByNameAndStateId(botanicalName, commonName, stateId.Value);
                if (stateSpecies == null) { return new NotFoundResult(); }
                model.StateDetails = Mapper.Map<StateMeasuredSpecies, BrowseSpeciesStateDetailsModel>(stateSpecies);
                IList<SiteMeasuredSpecies> allSiteSpecies = Repositories.Trees.ListMeasuredSpeciesForSitesByNameAndStateId(botanicalName, commonName, stateId.Value);
                var siteSpeciesDataSource = allSiteSpecies.SortAndPageInMemory(
                    column =>
                    {
                        if ("Site".Equals(column)) { return species => species.Site.Name; }
                        if ("MaxHeight".Equals(column)) { return species => species.MaxHeight; }
                        if ("MaxGirth".Equals(column)) { return species => species.MaxGirth; }
                        if ("MaxCrownSpread".Equals(column)) { return species => species.MaxCrownSpread; }
                        throw new NotImplementedException();
                    },
                    siteSpeciesSort, siteSpeciesSortAsc, siteSpeciesPage, 10);
                model.SiteSpeciesPage = siteSpeciesDataSource;
                model.SiteSpeciesTotalCount = siteSpeciesDataSource.TotalRowCount;
            }
            return View(model);
        }

        [DefaultReturnUrl]
        public virtual ActionResult StateDetails(int id,
            int? stateSpeciesPage = null, string stateSpeciesSort = null, bool? stateSpeciesSortAsc = null,
            int? subsitesPage = null, string subsitesSort = null, bool? subsitesSortAsc = null)
        {
            var state = Repositories.Locations.FindVisitedStateById(id);
            if (state == null) { return new NotFoundResult(); }
            var model = Mapper.Map<VisitedState, BrowseStateModel>(state);
            IList<StateMeasuredSpecies> allStateSpecies = Repositories.Trees.ListMeasuredSpeciesByStateId(state.Id);
            var stateSpeciesDataSource = allStateSpecies.SortAndPageInMemory(
                column =>
                {
                    if ("BotanicalName".Equals(column)) { return species => species.ScientificName; }
                    if ("CommonName".Equals(column)) { return species => species.CommonName; }
                    if ("MaxHeight".Equals(column)) { return species => species.MaxHeight; }
                    if ("MaxGirth".Equals(column)) { return species => species.MaxGirth; }
                    if ("MaxCrownSpread".Equals(column)) { return species => species.MaxCrownSpread; }
                    throw new NotImplementedException();
                },
                stateSpeciesSort, stateSpeciesSortAsc, stateSpeciesPage, 10);
            model.StateSpeciesPage = stateSpeciesDataSource;
            model.StateSpeciesTotalCount = stateSpeciesDataSource.TotalRowCount;
            IList<Subsite> allSubsites = Repositories.Sites.FindSubsitesByStateId(state.Id);
            var subsitesDataSource = allSubsites.SortAndPageInMemory(
                column =>
                {
                    if ("Site".Equals(column)) { return subsite => subsite.Site.Name; }
                    if ("Subsite".Equals(column)) { return subsite => subsite.Name; }
                    throw new NotImplementedException();
                },
                subsitesSort, subsitesSortAsc, subsitesPage, 10);
            model.SubsitesPage = subsitesDataSource;
            model.SubsitesTotalCount = subsitesDataSource.TotalRowCount;
            return View(model);
        }

        [DefaultReturnUrl]
        public virtual ActionResult Species(int? page = null, string sort = null, bool? sortAsc = null, 
            string botanicalNameFilter = "", string commonNameFilter = "")
        {
            SpeciesBrowser browser = new SpeciesBrowser
            {
                PageIndex = page ?? 0,
                PageSize = 40,
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
                PageSize = 40,
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
                PageSize = 20,
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
                PageSize = 20,
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
