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
using MvcContrib.UI.Grid;

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

        public virtual ActionResult Index()
        {
            return View();
        }

        [DefaultReturnUrl]
        public virtual ActionResult TreeDetails(int id)
        {
            var tree = Repositories.Trees.FindById(id);
            var site = Repositories.Sites.FindSiteContainingTree(id);
            var subsite = site.Subsites.Where(ss => ss.Trees.Contains(tree)).First();
            var model = Mapper.Map<Tree, BrowseTreeModel>(tree);
            Mapper.Map(site, model.Location);
            Mapper.Map(subsite, model.Location);
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
            throw new NotImplementedException();
        }

        [DefaultReturnUrl]
        public virtual ActionResult SpeciesDetails(int id)
        {
            throw new NotImplementedException();
        }

        [DefaultReturnUrl]
        public virtual ActionResult StateDetails(int id)
        {
            throw new NotImplementedException();
        }

        [DefaultReturnUrl]
        public virtual ActionResult Species(int? page, GridSortOptions sort = null)
        {
            sort = sort ?? new GridSortOptions { Column = "ScientificName", Direction = MvcContrib.Sorting.SortDirection.Ascending };
            SpeciesBrowser browser = new SpeciesBrowser
            {
                PageNumber = page ?? 1,
                PageSize = 5,
                BotanicalNameFilter = string.Empty,
                CommonNameFilter = string.Empty,
                SortAscending = sort.Direction == MvcContrib.Sorting.SortDirection.Ascending,
                SortProperty = "ScientificName".Equals(sort.Column) ? SpeciesBrowser.Property.BotanicalName
                    : "CommonName".Equals(sort.Column) ? SpeciesBrowser.Property.CommonName
                    : (SpeciesBrowser.Property?)null
            };
            var model = new PageModelBase<MeasuredSpecies> (Repositories.Trees.ListAllMeasuredSpecies(browser)) { Sort = sort };
            return View(model);
        }

        [DefaultReturnUrl]
        public virtual ActionResult Locations()
        {
            throw new NotImplementedException();
        }
    }
}
