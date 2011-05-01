using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using AutoMapper;
using TMD.Models;
using TMD.Model.Photos;
using TMD.Model;

namespace TMD.Mappings
{
    public class MapMapping : Profile
    {
        protected override void Configure()
        {
            configureForCoordinatePickers();
            configureForMarkerInfo();
            configureForMaps();
            configureForMarkers();
        }

        private void configureForMarkerInfo()
        {
            CreateMap<Model.Imports.TreeBase, MapImportTreeMarkerInfoModel>();
            CreateMap<Model.Imports.Subsite, MapImportSubsiteMarkerInfoModel>();
            CreateMap<Model.Imports.Site, MapImportSiteMarkerInfoModel>();

            CreateMap<Model.Sites.Site, MapSiteMarkerInfoModel>()
                .ForMember(dest => dest.State, opt => opt.MapFrom(src => src.Subsites[0].State))
                .ForMember(dest => dest.County, opt => opt.MapFrom(src => src.Subsites[0].County))
                .ForMember(dest => dest.OwnershipType, opt => opt.MapFrom(src => src.Subsites[0].OwnershipType))
                .ForMember(dest => dest.Photos, opt => opt.MapFrom(src => src.Subsites[0].Photos));
            CreateMap<Model.Sites.Subsite, MapSubsiteMarkerInfoModel>();
            CreateMap<Model.Trees.Tree, MapTreeMarkerInfoModel>();
        }

        private void configureForCoordinatePickers()
        {
            CreateMap<CoordinatePickerModel, Coordinates>()
                .ForMember(dest => dest.Latitude, opt => opt.MapFrom(src => src.Coordinates.Latitude.Clone() as Latitude))
                .ForMember(dest => dest.Longitude, opt => opt.MapFrom(src => src.Coordinates.Longitude.Clone() as Longitude));

            CreateMap<Model.Imports.TreeBase, CoordinatePickerModel>()
                .ForMember(dest => dest.MarkerLoaderAction, opt => opt.MapFrom(src => Mvc.Map.ImportTreeMarkers(src.Subsite.Site.Trip.Id, src.Id)));
            
            CreateMap<Model.Imports.Subsite, CoordinatePickerModel>()
                .ForMember(dest => dest.MarkerLoaderAction, opt => opt.MapFrom(src => Mvc.Map.ImportSubsiteMarkers(src.Site.Trip.Id, src.Id)));
            
            CreateMap<Model.Imports.Site, CoordinatePickerModel>()
                .ForMember(dest => dest.MarkerLoaderAction, opt => opt.MapFrom(src => Mvc.Map.ImportSiteMarkers(src.Trip.Id, src.Id)));
        }

        private void configureForMaps()
        {
            CreateMap<Model.Sites.Site, MapModel>()
                .ForMember(dest => dest.Zoom, opt => opt.MapFrom(src => src.ContainsSingleSubsite ? 13 : 11))
                .ForMember(dest => dest.Center, opt => opt.MapFrom(src => src.CalculatedCoordinates))
                .ForMember(dest => dest.MarkerLoaderAction, opt => opt.MapFrom(src => Mvc.Map.TreeMarker(src.Id)));

            CreateMap<Model.Sites.Subsite, MapModel>()
                .ForMember(dest => dest.Zoom, opt => opt.UseValue(13))
                .ForMember(dest => dest.Center, opt => opt.MapFrom(src => src.CalculatedCoordinates))
                .ForMember(dest => dest.MarkerLoaderAction, opt => opt.MapFrom(src => Mvc.Map.SubsiteMarker(src.Site.Id, src.Id)));

            CreateMap<Model.Trees.Tree, MapModel>()
                .ForMember(dest => dest.Zoom, opt => opt.UseValue(30))
                .ForMember(dest => dest.Center, opt => opt.MapFrom(src => src.CalculatedCoordinates))
                .ForMember(dest => dest.MarkerLoaderAction, opt => opt.MapFrom(src => Mvc.Map.TreeMarker(src.Id)));

            CreateMap<IEnumerable<Model.Sites.Site>, MapModel>()
                .ForMember(dest => dest.Bounds, opt => opt.MapFrom(src => CoordinateBounds.Create(from site in src select site.Coordinates)))
                .ForMember(dest => dest.MarkerLoaderAction, opt => opt.MapFrom(src => Mvc.Map.AllMarkers()));
        }

        private void configureForMarkers()
        {
            CreateMap<Model.Imports.Site, MapMarkerModel>()
                .ForMember(dest => dest.Title, opt => opt.MapFrom(src => src.Name))
                .ForMember(dest => dest.Position, opt => opt.MapFrom(src => src.Coordinates))
                .ForMember(dest => dest.DefaultIconUrl, opt => opt.UseValue(Links.images.icons.Site32_png))
                .ForMember(dest => dest.InfoLoaderAction, opt => opt.MapFrom(src => Mvc.Map.ImportSiteMarkerInfo(src.Trip.Id, src.Id)));

            CreateMap<Model.Imports.Subsite, MapMarkerModel>()
                .ForMember(dest => dest.Title, opt => opt.MapFrom(src => src.Name))
                .ForMember(dest => dest.Position, opt => opt.MapFrom(src => src.Coordinates))
                .ForMember(dest => dest.DefaultIconUrl, opt => opt.MapFrom(src => src.Site.Subsites.Count == 1 ? Links.images.icons.Site32_png : Links.images.icons.Subsite32_png))
                .ForMember(dest => dest.IconLoaderAction, opt => opt.MapFrom(src => src.Photos.Count == 0 ? null : Mvc.Photos.ViewPhoto(src.Photos[0].StaticId, PhotoSize.SmallMapSquare)))
                .ForMember(dest => dest.InfoLoaderAction, opt => opt.MapFrom(src => Mvc.Map.ImportSubsiteMarkerInfo(src.Site.Trip.Id, src.Id)));

            CreateMap<Model.Imports.TreeBase, MapMarkerModel>()
                .ForMember(dest => dest.Title, opt => opt.MapFrom(src => src.ScientificName))
                .ForMember(dest => dest.Position, opt => opt.MapFrom(src => src.Coordinates))
                .ForMember(dest => dest.DefaultIconUrl, opt => opt.UseValue(Links.images.icons.SingleTrunkTree32_png))
                .ForMember(dest => dest.IconLoaderAction, opt => opt.MapFrom(src => src.Photos.Count == 0 ? null : Mvc.Photos.ViewPhoto(src.Photos[0].StaticId, PhotoSize.SmallMapSquare)))
                .ForMember(dest => dest.InfoLoaderAction, opt => opt.MapFrom(src => Mvc.Map.ImportTreeMarkerInfo(src.Subsite.Site.Trip.Id, src.Id)));

            CreateMap<Model.Sites.Site, MapMarkerModel>()
                .ForMember(dest => dest.Title, opt => opt.MapFrom(src => src.Name))
                .ForMember(dest => dest.Position, opt => opt.MapFrom(src => src.CalculatedCoordinates))
                .ForMember(dest => dest.DefaultIconUrl, opt => opt.UseValue(Links.images.icons.Site32_png))
                .ForMember(dest => dest.MinZoom, opt => opt.UseValue(0))
                .ForMember(dest => dest.MaxZoom, opt => opt.MapFrom(src => src.ContainsSingleSubsite ? 13 : 11))
                .ForMember(dest => dest.IconLoaderAction, opt => opt.MapFrom(src => src.Subsites.Count > 1 || src.Subsites[0].Photos.Count == 0 ?
                    null : Mvc.Photos.ViewPhoto(src.Subsites[0].Photos[0].StaticId, PhotoSize.SmallMapSquare)))
                .ForMember(dest => dest.InfoLoaderAction, opt => opt.MapFrom(src => Mvc.Map.SiteMarkerInfo(src.Id)));

            CreateMap<Model.Sites.Subsite, MapMarkerModel>()
                .ForMember(dest => dest.Title, opt => opt.MapFrom(src => src.Name))
                .ForMember(dest => dest.Position, opt => opt.MapFrom(src => src.CalculatedCoordinates))
                .ForMember(dest => dest.MinZoom, opt => opt.UseValue(12))
                .ForMember(dest => dest.MaxZoom, opt => opt.UseValue(13))
                .ForMember(dest => dest.DefaultIconUrl, opt => opt.UseValue(Links.images.icons.Subsite32_png))
                .ForMember(dest => dest.IconLoaderAction, opt => opt.MapFrom(src => src.Photos.Count == 0 ?
                    null : Mvc.Photos.ViewPhoto(src.Photos[0].StaticId, PhotoSize.SmallMapSquare)))
                .ForMember(dest => dest.InfoLoaderAction, opt => opt.MapFrom(src => Mvc.Map.SubsiteMarkerInfo(src.Site.Id, src.Id)));

            CreateMap<Model.Trees.Tree, MapMarkerModel>()
                .ForMember(dest => dest.Title, opt => opt.MapFrom(src => src.ScientificName))
                .ForMember(dest => dest.Position, opt => opt.MapFrom(src => src.CalculatedCoordinates))
                .ForMember(dest => dest.MinZoom, opt => opt.UseValue(14))
                .ForMember(dest => dest.MaxZoom, opt => opt.UseValue(30))
                .ForMember(dest => dest.DefaultIconUrl, opt => opt.UseValue(Links.images.icons.SingleTrunkTree32_png))
                .ForMember(dest => dest.IconLoaderAction, opt => opt.MapFrom(src => src.Photos.Count == 0 ?
                    null : Mvc.Photos.ViewPhoto(src.Photos[0].StaticId, PhotoSize.SmallMapSquare)))
                .ForMember(dest => dest.InfoLoaderAction, opt => opt.MapFrom(src => Mvc.Map.TreeMarkerInfo(src.Id)));
        }
    }
}