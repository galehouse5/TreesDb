﻿using AutoMapper;
using System.Collections.Generic;
using System.Linq;
using TMD.Model;
using TMD.Model.Photos;
using TMD.Models;
using TMD.Models.Map;

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
            CreateMap<Model.Imports.Site, MapImportSiteMarkerInfoModel>();

            CreateMap<Model.Sites.Site, MapSiteMarkerInfoModel>()
                .ForGeoAreaMetricsMembers();
            CreateMap<Model.Locations.State, MapStateMarkerInfoModel>()
                .ForGeoAreaMetricsMembers();
            CreateMap<Model.Trees.Tree, MapTreeMarkerInfoModel>();
        }

        private void configureForCoordinatePickers()
        {
            CreateMap<CoordinatePickerModel, Coordinates>()
                .ForMember(dest => dest.Latitude, opt => opt.MapFrom(src => src.Coordinates.Latitude.Clone() as Latitude))
                .ForMember(dest => dest.Longitude, opt => opt.MapFrom(src => src.Coordinates.Longitude.Clone() as Longitude));

            CreateMap<Model.Imports.TreeBase, CoordinatePickerModel>()
                .ForMember(dest => dest.MarkerLoaderAction, opt => opt.MapFrom(src => MVC.Map.ImportTreeMarkers(src.Site.Trip.Id, src.Id)));

            CreateMap<Model.Imports.Site, CoordinatePickerModel>()
                .ForMember(dest => dest.MarkerLoaderAction, opt => opt.MapFrom(src => MVC.Map.ImportSiteMarkers(src.Trip.Id, src.Id)));
        }

        private void configureForMaps()
        {
            CreateMap<Model.Sites.Site, MapModel>()
                .ForMember(dest => dest.Zoom, opt => opt.UseValue(13))
                .ForMember(dest => dest.Center, opt => opt.MapFrom(src => src.CalculatedCoordinates))
                .ForMember(dest => dest.MarkerLoaderAction, opt => opt.MapFrom(src => MVC.Map.SiteMarker(src.Id)));

            CreateMap<Model.Trees.Tree, MapModel>()
                .ForMember(dest => dest.Zoom, opt => opt.UseValue(30))
                .ForMember(dest => dest.Center, opt => opt.MapFrom(src => src.CalculatedCoordinates))
                .ForMember(dest => dest.MarkerLoaderAction, opt => opt.MapFrom(src => MVC.Map.TreeMarker(src.Id)));

            CreateMap<IEnumerable<Model.Sites.Site>, MapModel>()
                .ForMember(dest => dest.Bounds, opt => opt.MapFrom(src => CoordinateBounds.Create(from site in src select site.Coordinates)))
                .ForMember(dest => dest.MarkerLoaderAction, opt => opt.MapFrom(src => MVC.Map.AllMarkers()));
        }

        private void configureForMarkers()
        {
            CreateMap<Model.Imports.Site, MapMarkerModel>()
                .ForMember(dest => dest.Title, opt => opt.MapFrom(src => src.Name))
                .ForMember(dest => dest.Position, opt => opt.MapFrom(src => src.Coordinates))
                .ForMember(dest => dest.DefaultIconUrl, opt => opt.MapFrom(src => $"{Links.images.icons.Site32_png}?v=2"))
                .ForMember(dest => dest.IconLoaderAction, opt => opt.MapFrom(src => src.Photos.Count == 0 ? null : MVC.Photos.ViewPhoto(src.Photos[0].StaticId, PhotoSize.SmallMapSquare)))
                .ForMember(dest => dest.InfoLoaderAction, opt => opt.MapFrom(src => MVC.Map.ImportSiteMarkerInfo(src.Trip.Id, src.Id)));

            CreateMap<Model.Imports.TreeBase, MapMarkerModel>()
                .ForMember(dest => dest.Title, opt => opt.MapFrom(src => src.ScientificName))
                .ForMember(dest => dest.Position, opt => opt.MapFrom(src => src.Coordinates))
                .ForMember(dest => dest.DefaultIconUrl, opt => opt.UseValue(Links.images.icons.Tree32_png))
                .ForMember(dest => dest.IconLoaderAction, opt => opt.MapFrom(src => src.Photos.Count == 0 ? null : MVC.Photos.ViewPhoto(src.Photos[0].StaticId, PhotoSize.SmallMapSquare)))
                .ForMember(dest => dest.InfoLoaderAction, opt => opt.MapFrom(src => MVC.Map.ImportTreeMarkerInfo(src.Site.Trip.Id, src.Id)));

            CreateMap<Model.Locations.State, MapMarkerModel>()
                .ForMember(dest => dest.Title, opt => opt.MapFrom(src => src.Name))
                .ForMember(dest => dest.Position, opt => opt.MapFrom(src => src.CoordinateBounds.Center))
                .ForMember(dest => dest.MinZoom, opt => opt.UseValue(0))
                .ForMember(dest => dest.MaxZoom, opt => opt.MapFrom(src => src.ComputedContainsEntityWithCoordinates == false ? 30 : 6))
                .ForMember(dest => dest.DefaultIconUrl, opt => opt.UseValue(Links.images.icons.State32_png))
                .ForMember(dest => dest.InfoLoaderAction, opt => opt.MapFrom(src => MVC.Map.StateMarkerInfo(src.Id)));

            CreateMap<Model.Sites.Site, MapMarkerModel>()
                .ForMember(dest => dest.Title, opt => opt.MapFrom(src => src.Name))
                .ForMember(dest => dest.Position, opt => opt.MapFrom(src => src.CalculatedCoordinates))
                .ForMember(dest => dest.MinZoom, opt => opt.UseValue(7))
                .ForMember(dest => dest.MaxZoom, opt => opt.MapFrom(src => src.ComputedContainsEntityWithCoordinates == false ? 30 : 13))
                .ForMember(dest => dest.DefaultIconUrl, opt => opt.UseValue($"{Links.images.icons.Site32_png}?v=2"))
                .ForMember(dest => dest.IconLoaderAction, opt => opt.MapFrom(src => src.Photos.Count == 0 ?
                    null : MVC.Photos.ViewPhoto(src.Photos[0].StaticId, PhotoSize.SmallMapSquare)))
                .ForMember(dest => dest.InfoLoaderAction, opt => opt.MapFrom(src => MVC.Map.SiteMarkerInfo(src.Id)));

            CreateMap<Model.Trees.Tree, MapMarkerModel>()
                .ForMember(dest => dest.Title, opt => opt.MapFrom(src => src.ScientificName))
                .ForMember(dest => dest.Position, opt => opt.MapFrom(src => src.CalculatedCoordinates))
                .ForMember(dest => dest.MinZoom, opt => opt.UseValue(14))
                .ForMember(dest => dest.MaxZoom, opt => opt.UseValue(30))
                .ForMember(dest => dest.DefaultIconUrl, opt => opt.UseValue(Links.images.icons.Tree32_png))
                .ForMember(dest => dest.IconLoaderAction, opt => opt.MapFrom(src => src.Photos.Count == 0 ?
                    null : MVC.Photos.ViewPhoto(src.Photos[0].StaticId, PhotoSize.SmallMapSquare)))
                .ForMember(dest => dest.InfoLoaderAction, opt => opt.MapFrom(src => MVC.Map.TreeMarkerInfo(src.Id)));
        }
    }
}