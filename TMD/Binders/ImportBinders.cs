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
            var trip = Repositories.Imports.FindById(model.Id);
            model.Sites.Where(siteModel => !siteModel.IsEditing).ForEach(siteModel =>
                {
                    var site = trip.FindSiteById(siteModel.Id);
                    Mapper.Map(site, siteModel);
                });
            model.Sites.Where(siteModel => siteModel.IsEditing).ForEach(siteModel =>
                {
                    var site = trip.FindSiteById(siteModel.Id);
                    if (siteModel.Coordinates == null) 
                    {
                        siteModel.Coordinates = Mapper.Map<Site, ImportSiteCoordinatePickerModel>(site);
                    } 
                    else 
                    {
                        siteModel.Coordinates.SiteId = site.Id;
                        siteModel.Coordinates.TripId = trip.Id;
                    }
                    siteModel.Subsites.ForEach(subsiteModel =>
                        {
                            var subsite = site.FindSubsiteById(subsiteModel.Id);
                            subsiteModel.Photos = Mapper.Map<Subsite, ImportSubsitePhotoGalleryModel>(subsite);
                            if (subsiteModel.Coordinates == null) 
                            {
                                subsiteModel.Coordinates = Mapper.Map<Subsite, ImportSubsiteCoordinatePickerModel>(subsite);
                            } 
                            else 
                            {
                                subsiteModel.Coordinates.SubsiteId = subsite.Id;
                                subsiteModel.Coordinates.TripId = trip.Id;
                            }
                        });
                    if (siteModel.Subsites.Count == 1)
                    {
                        siteModel.Name = siteModel.Subsites[0].Name;
                        siteModel.Comments = siteModel.Subsites[0].Comments;
                        siteModel.Coordinates.Coordinates = siteModel.Subsites[0].Coordinates.Coordinates;
                    }
                });
            return model;
        }
    }

    public class ImportTreesModelBinder : DefaultModelBinder
    {
        public override object BindModel(ControllerContext controllerContext, ModelBindingContext bindingContext)
        {
            var model = (ImportTreesModel)base.BindModel(controllerContext, bindingContext);
            var trip = Repositories.Imports.FindById(model.Id);
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
                                    treeModel.Photos = Mapper.Map<TreeBase, ImportTreePhotoGalleryModel>(tree);
                                    if (treeModel.Coordinates == null)
                                    {
                                        treeModel.Coordinates = Mapper.Map<TreeBase, ImportTreeCoordinatePickerModel>(tree);
                                    }
                                    else
                                    {
                                        treeModel.Coordinates.TreeId = tree.Id;
                                        treeModel.Coordinates.TripId = trip.Id;
                                    }
                                });
                        });
                });
            return model;
        }
    }
}