using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.Web.Mvc;
using TMD.Models;
using TMD.Model;
using AutoMapper;
using TMD.Model.Extensions;

namespace TMD.Binders
{
    public class ImportSitesModelBinder : DefaultModelBinder
    {
        public override object BindModel(ControllerContext controllerContext, ModelBindingContext bindingContext)
        {
            var model = (ImportSitesModel)base.BindModel(controllerContext, bindingContext);
            Model.Trips.Trip trip = Repositories.Trips.FindById(model.Id);
            model.Sites.Where(s => !s.IsEditing).ForEach(s =>
                Mapper.Map<Model.Trips.SiteVisit, ImportSiteModel>(trip.SiteVisits.First(sv => sv.Id == s.Id), s));
            return model;
        }
    }

    public class ImportTreesModelBinder : DefaultModelBinder
    {
        public override object BindModel(ControllerContext controllerContext, ModelBindingContext bindingContext)
        {
            var model = (ImportTreesModel)base.BindModel(controllerContext, bindingContext);
            Model.Trips.Trip trip = Repositories.Trips.FindById(model.Id);
            model.Sites.ForEach(
                s => s.Subsites.ForEach(
                    ss => ss.Trees.Where(t => !t.IsEditing).ForEach(t =>
                        Mapper.Map<Model.Trips.TreeMeasurementBase, ImportTreeModel>(
                            trip.SiteVisits.First(sv => sv.Id.Equals(s.Id))
                                .SubsiteVisits.First(ssv => ssv.Id.Equals(ss.Id))
                                .TreeMeasurements.First(tm => tm.Id.Equals(t.Id)), t)
                        )
                )
            );
            return model;
        }
    }
}