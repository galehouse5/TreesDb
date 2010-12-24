using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.Web.Mvc;
using TMD.Models;
using TMD.Model;
using AutoMapper;
using TMD.Model.Extensions;
using TMD.Model.Trips;

namespace TMD.Binders
{
    public class ImportSitesModelBinder : DefaultModelBinder
    {
        public override object BindModel(ControllerContext controllerContext, ModelBindingContext bindingContext)
        {
            var model = (ImportSitesModel)base.BindModel(controllerContext, bindingContext);
            var trip = Repositories.Trips.FindById(model.Id);
            model.Sites.Where(s => !s.IsEditing).ForEach(s =>
                Mapper.Map<SiteVisit, ImportSiteModel>(trip.SiteVisits.First(sv => sv.Id == s.Id), s));
            return model;
        }
    }

    public class ImportTreesModelBinder : DefaultModelBinder
    {
        public override object BindModel(ControllerContext controllerContext, ModelBindingContext bindingContext)
        {
            var model = (ImportTreesModel)base.BindModel(controllerContext, bindingContext);
            var trip = Repositories.Trips.FindById(model.Id);
            model.Sites.ForEach(s =>
                {
                    var site = trip.FindSiteVisitById(s.Id);
                    s.Name = site.Name;
                    s.Subsites.ForEach(ss =>
                        {
                            var subsite = site.FindSubsiteVisitById(ss.Id);
                            ss.Name = subsite.Name;
                            ss.Trees.Where(t => !t.IsEditing).ForEach(t =>
                                {
                                    var tree = subsite.FindTreeMeasurementById(t.Id);
                                    Mapper.Map<TreeMeasurementBase, ImportTreeModel>(tree, t);
                                });
                        });
                });
            return model;
        }
    }
}