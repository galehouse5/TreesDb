using AutoMapper;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Web.Mvc;
using TMD.Extensions;
using TMD.Model;
using TMD.Model.Locations;
using TMD.Model.Sites;
using TMD.Model.Trees;
using TMD.Models.Browse;

namespace TMD.Controllers
{
    [CheckBrowserCompatibilityFilter]
    public partial class BrowseController : ControllerBase
    {
        [ChildActionOnly]
        public virtual ActionResult MenuWidget(bool isSelected)
        {
            return PartialView("_MenuWidget", new BrowseMenuWidgetModel { IsSelected = isSelected });
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
            int? page = null, string sort = null, bool? sortAsc = null)
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
                sort, sortAsc, page, 10);
            var subsiteSpeciesGridModel = new EntityGridModel<SubsiteMeasuredSpecies>(subsiteSpeciesDataSource) { RowsPerPage = 10 };
            if (Request.IsAjaxRequest())
            {
                return PartialView("SubsiteSpeciesGridPartial", subsiteSpeciesGridModel);
            }
            var model = new BrowseSiteModel
            {
                Id = id,
                Details = Mapper.Map<Subsite, BrowseSubsiteDetailsModel>(subsite),
                Location = Mapper.Map<Subsite, BrowseSubsiteLocationModel>(subsite),
                PhotoSummaries = Mapper.Map<IEnumerable<SubsiteVisit>, IList<BrowsePhotoSumaryModel>>(visitsWithPhotos),
                Visits = Mapper.Map<IEnumerable<SiteVisit>, IList<BrowseSiteVisitModel>>(siteVisits),
                SubsiteSpeciesModel = subsiteSpeciesGridModel
            };
            return View(model);
        }

        [DefaultReturnUrl]
        public virtual ActionResult SpeciesDetails(string botanicalName, string commonName, int? siteId = null, int? stateId = null,
            int? stateSpeciesPage = null, string stateSpeciesSort = null, bool? stateSpeciesSortAsc = null,
            int? treesPage = null, string treesSort = null, bool? treesSortAsc = null,
            int? siteSpeciesPage = null, string siteSpeciesSort = null, bool? siteSpeciesSortAsc = null,
            string parameterNamePrefix = null)
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
            var stateSpeciesGridModel = new EntityGridModel<StateMeasuredSpecies>(stateSpeciesDataSource) { ParameterNamePrefix = "stateSpecies", RowsPerPage = 10 };
            if (Request.IsAjaxRequest() && "stateSpecies".Equals(parameterNamePrefix))
            {
                return PartialView("SpeciesByStateGridPartial", stateSpeciesGridModel);
            }
            model.StateSpeciesModel = stateSpeciesGridModel;
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
                var treesGridModel = new EntityGridModel<Tree>(treesDataSource) { ParameterNamePrefix = "trees", RowsPerPage = 10 };
                if (Request.IsAjaxRequest() && "trees".Equals(parameterNamePrefix))
                {
                    return PartialView("TreesGridPartial", treesGridModel);
                }
                model.TreesModel = treesGridModel;
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
                var siteSpeciesGridModel = new EntityGridModel<SiteMeasuredSpecies>(siteSpeciesDataSource) { ParameterNamePrefix = "siteSpecies", RowsPerPage = 10 };
                if (Request.IsAjaxRequest() && "siteSpecies".Equals(parameterNamePrefix))
                {
                    return PartialView("SiteSpeciesGridPartial", siteSpeciesGridModel);
                }
                model.SiteSpeciesModel = siteSpeciesGridModel;
            }
            return View(model);
        }

        [DefaultReturnUrl]
        public virtual ActionResult StateDetails(int id,
            int? stateSpeciesPage = null, string stateSpeciesSort = null, bool? stateSpeciesSortAsc = null,
            int? subsitesPage = null, string subsitesSort = null, bool? subsitesSortAsc = null,
            string parameterNamePrefix = null)
        {
            var state = Repositories.Locations.FindStateById(id);
            if (state == null) { return new NotFoundResult(); }
            var model = Mapper.Map<State, BrowseStateModel>(state);
            IEnumerable<StateMeasuredSpecies> allStateSpecies = Repositories.Trees.ListMeasuredSpeciesByStateId(state.Id);
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
            var stateSpeciesGridModel = new EntityGridModel<StateMeasuredSpecies>(stateSpeciesDataSource) { ParameterNamePrefix = "stateSpecies", RowsPerPage = 10 };
            if (Request.IsAjaxRequest() && "stateSpecies".Equals(parameterNamePrefix))
            {
                return PartialView("StateSpeciesGridPartial", stateSpeciesGridModel);
            }
            model.StateSpeciesModel = stateSpeciesGridModel;
            IList<Subsite> allSubsites = Repositories.Sites.FindSubsitesByStateId(state.Id);
            var subsitesDataSource = allSubsites.SortAndPageInMemory(
                column =>
                {
                    if ("Site".Equals(column)) { return subsite => subsite.Site.Name; }
                    if ("RHI5".Equals(column)) { return subsite => subsite.Site.ComputedRHI5; }
                    if ("RHI10".Equals(column)) { return subsite => subsite.Site.ComputedRHI10; }
                    if ("RGI5".Equals(column)) { return subsite => subsite.Site.ComputedRGI5; }
                    if ("RGI10".Equals(column)) { return subsite => subsite.Site.ComputedRGI10; }
                    throw new NotImplementedException();
                },
                subsitesSort, subsitesSortAsc, subsitesPage, 10);
            var subsitesGridModel = new EntityGridModel<Subsite>(subsitesDataSource) { ParameterNamePrefix = "subsites", RowsPerPage = 10 };
            if (Request.IsAjaxRequest() && "subsites".Equals(parameterNamePrefix))
            {
                return PartialView("SitesGridPartial", subsitesGridModel);
            }
            model.SitesModel = subsitesGridModel;
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
                    : "MaxHeight".Equals(sort) ? SpeciesBrowser.Property.MaxHeight
                    : "MaxGirth".Equals(sort) ? SpeciesBrowser.Property.MaxGirth
                    : "MaxCrownSpread".Equals(sort) ? SpeciesBrowser.Property.MaxCrownSpread
                    : SpeciesBrowser.Property.BotanicalName
            };
            var model = Repositories.Trees.ListAllMeasuredSpecies<GlobalMeasuredSpecies>(browser);
            var gridModel = new EntityGridModel<GlobalMeasuredSpecies>(model) { RowsPerPage = 40 };
            if (Request.IsAjaxRequest()) 
            {
                return PartialView("GlobalSpeciesGridPartial", gridModel);
            }
            return View(gridModel);
        }

        [DefaultReturnUrl]
        public virtual ActionResult Locations(int? page = null, string sort = null, bool? sortAsc = null,
            string stateFilter = "", string countyFilter = "", string siteFilter = "", string subsiteFilter = "")
        {
            SubsiteBrowser browser = new SubsiteBrowser
            {
                PageIndex = page ?? 0,
                PageSize = 40,
                StateFilter = stateFilter, CountyFilter = countyFilter, SiteFilter = siteFilter, SubsiteFilter = subsiteFilter,
                SortAscending = !sortAsc.HasValue || sortAsc.Value,
                SortProperty = "State".Equals(sort) ? SubsiteBrowser.Property.State
                    : "Site".Equals(sort) ? SubsiteBrowser.Property.Site
                    : "County".Equals(sort) ? SubsiteBrowser.Property.County
                    : "RHI5".Equals(sort) ? SubsiteBrowser.Property.RHI5
                    : "RHI10".Equals(sort) ? SubsiteBrowser.Property.RHI10
                    : "RGI5".Equals(sort) ? SubsiteBrowser.Property.RGI5
                    : "RGI10".Equals(sort) ? SubsiteBrowser.Property.RGI10
                    : "LastMeasurement".Equals(sort) ? SubsiteBrowser.Property.LastMeasurement
                    : (SubsiteBrowser.Property?)null
            };
            var model = Repositories.Sites.ListAllSubsites(browser);
            var gridModel = new EntityGridModel<Subsite>(model) { RowsPerPage = 40 };
            if (Request.IsAjaxRequest()) 
            {
                return PartialView("LocationsGridPartial", gridModel);
            }
            return View(gridModel);
        }

        [DefaultReturnUrl]
        public virtual ActionResult Activity() => View();
        
        [ChildActionOnly]
        public virtual ActionResult RecentTrips()
        {
            var visits = Repositories.Sites.ListRecentSubsiteVisits(40);
            return PartialView("_RecentTrips", visits.Select(TripLogModel.Create));
        }

        [ChildActionOnly]
        public virtual ActionResult MostActiveMeasurers()
        {
            var measurers = Repositories.Trees.ListMostActiveMeasurers(40);
            return PartialView("_MostActiveMeasurers", measurers.Select(MeasurerActivityModel.Create));
        }
    }
}
