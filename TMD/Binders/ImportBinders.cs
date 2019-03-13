using AutoMapper;
using System.Linq;
using System.Web.Mvc;
using TMD.Model;
using TMD.Model.Extensions;
using TMD.Model.Imports;
using TMD.Models;
using TMD.Models.Import;
using TMD.Models.Map;

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
                    siteModel.Coordinates = Mapper.Map<Site, CoordinatePickerModel>(site);
                }
                else
                {
                    siteModel.Coordinates.MarkerLoaderAction = MVC.Map.ImportSiteMarkers(trip.Id, site.Id);
                }

                siteModel.Photos = Mapper.Map<Site, ImportSitePhotoGalleryModel>(site);
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

                    siteModel.Trees.Where(treeModel => !treeModel.IsEditing).ForEach(treeModel =>
                    {
                        var tree = site.FindTreeById(treeModel.Id);
                        Mapper.Map(tree, treeModel);
                    });

                    siteModel.Trees.Where(treeModel => treeModel.IsEditing).ForEach(treeModel =>
                    {
                        var tree = site.FindTreeById(treeModel.Id);
                        treeModel.Photos = Mapper.Map<TreeBase, ImportTreePhotoGalleryModel>(tree);
                        if (treeModel.Coordinates == null)
                        {
                            treeModel.Coordinates = Mapper.Map<TreeBase, CoordinatePickerModel>(tree);
                        }
                        else
                        {
                            treeModel.Coordinates.MarkerLoaderAction = MVC.Map.ImportTreeMarkers(trip.Id, tree.Id);
                        }
                    });
                });
            return model;
        }
    }
}