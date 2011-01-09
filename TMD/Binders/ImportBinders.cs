using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.Web.Mvc;
using TMD.Models;
using TMD.Model;
using AutoMapper;
using TMD.Model.Extensions;
using TMD.Model.Imports;

namespace TMD.Binders
{
    public class ImportSitesModelBinder : DefaultModelBinder
    {
        public override object BindModel(ControllerContext controllerContext, ModelBindingContext bindingContext)
        {
            var model = (ImportSitesModel)base.BindModel(controllerContext, bindingContext);
            var trip = Repositories.Trips.FindById(model.Id);
            model.Sites.Where(siteModel => !siteModel.IsEditing).ForEach(siteModel =>
                {
                    var site = trip.FindSiteById(siteModel.Id);
                    Mapper.Map(site, siteModel);
                });
            model.Sites.Where(siteModel => siteModel.IsEditing).ForEach(siteModel =>
                {
                    var site = trip.FindSiteById(siteModel.Id);
                    siteModel.Coordinates.MapLoader = new ImportSiteCoordinatePickerMapLoaderModel { SiteId = site.Id, TripId = trip.Id };
                    siteModel.Subsites.ForEach(subsiteModel =>
                        {
                            var subsite = site.FindSubsiteById(subsiteModel.Id);
                            subsiteModel.Photos = Mapper.Map<Subsite, PhotoGalleryModel>(subsite);
                            subsiteModel.Coordinates.MapLoader = new ImportSubsiteCoordinatePickerMapLoaderModel { SubsiteId = subsite.Id, TripId = trip.Id };
                        });
                });
            return model;
        }
    }

    public class ImportTreesModelBinder : DefaultModelBinder
    {
        public override object BindModel(ControllerContext controllerContext, ModelBindingContext bindingContext)
        {
            var model = (ImportTreesModel)base.BindModel(controllerContext, bindingContext);
            var trip = Repositories.Trips.FindById(model.Id);
            model.Sites.ForEach(siteModel =>
                {
                    var site = trip.FindSiteById(siteModel.Id);
                    siteModel.Name = site.Name;
                    siteModel.Subsites.ForEach(subsiteModel =>
                        {
                            var subsite = site.FindSubsiteById(subsiteModel.Id);
                            subsiteModel.Name = subsite.Name;
                            subsiteModel.Trees.Where(treeModel => !treeModel.IsEditing).ForEach(treeModel =>
                                {
                                    var tree = subsite.FindTreeById(treeModel.Id);
                                    Mapper.Map(tree, treeModel);
                                });
                            subsiteModel.Trees.Where(treeModel => treeModel.IsEditing).ForEach(treeModel =>
                                {
                                    var tree = subsite.FindTreeById(treeModel.Id);
                                    treeModel.Photos = Mapper.Map<TreeBase, PhotoGalleryModel>(tree);
                                    treeModel.Coordinates.MapLoader = new ImportTreeCoordinatePickerMapLoaderModel { TreeId = tree.Id, TripId = trip.Id };
                                });
                        });
                });
            return model;
        }
    }
}