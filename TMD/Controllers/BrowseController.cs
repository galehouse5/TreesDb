﻿using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.Web.Mvc;
using TMD.Models;
using TMD.Model;
using AutoMapper;
using TMD.Model.Trees;

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
            return View(Mapper.Map<Tree, BrowseTreeModel>(tree));
        }

        [DefaultReturnUrl]
        public virtual ActionResult SubsiteDetails(int id)
        {
            throw new NotImplementedException();
        }

        [DefaultReturnUrl]
        public virtual ActionResult SiteDetails(int id)
        {
            throw new NotImplementedException();
        }
    }
}
