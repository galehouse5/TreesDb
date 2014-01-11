using AutoMapper;
using System.Collections.Generic;
using System.Linq;
using TMD.Model;
using TMD.Model.Photos;
using TMD.Models;

namespace TMD.Mappings
{
    public class MapMapping : Profile
    {
        protected override void Configure()
        {
            configureForMarkerInfo();
            configureForMaps();
            configureForMarkers();
        }

        private void configureForMarkerInfo()
        {
            CreateMap<Model.Sites.Site, MapSiteMarkerInfoModel>()
                .ForMember(dest => dest.State, opt => opt.MapFrom(src => src.Subsites[0].State))
                .ForMember(dest => dest.County, opt => opt.MapFrom(src => src.Subsites[0].County))
                .ForMember(dest => dest.OwnershipType, opt => opt.MapFrom(src => src.Subsites[0].OwnershipType))
                .ForMember(dest => dest.Photos, opt => opt.MapFrom(src => src.Subsites[0].Photos));
            CreateMap<Model.Sites.Subsite, MapSubsiteMarkerInfoModel>();
            CreateMap<Model.Trees.Tree, MapTreeMarkerInfoModel>();
        }

        private void configureForMaps()
        {
            CreateMap<Model.Sites.Site, MapModel>()
                .ForMember(dest => dest.Zoom, opt => opt.MapFrom(src => src.ContainsSingleSubsite ? 13 : 11))
                .ForMember(dest => dest.Center, opt => opt.MapFrom(src => src.CalculatedCoordinates))
                .ForMember(dest => dest.MarkerLoaderAction, opt => opt.MapFrom(src => MVC.Map.TreeMarker(src.Id)));

            CreateMap<Model.Sites.Subsite, MapModel>()
                .ForMember(dest => dest.Zoom, opt => opt.UseValue(13))
                .ForMember(dest => dest.Center, opt => opt.MapFrom(src => src.CalculatedCoordinates))
                .ForMember(dest => dest.MarkerLoaderAction, opt => opt.MapFrom(src => MVC.Map.SubsiteMarker(src.Site.Id, src.Id)));

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
            CreateMap<Model.Sites.Site, MapMarkerModel>()
                .ForMember(dest => dest.Title, opt => opt.MapFrom(src => src.Name))
                .ForMember(dest => dest.Position, opt => opt.MapFrom(src => src.CalculatedCoordinates))
                .ForMember(dest => dest.DefaultIconUrl, opt => opt.UseValue(Links.images.icons.Site32_png))
                .ForMember(dest => dest.MinZoom, opt => opt.UseValue(0))
                .ForMember(dest => dest.MaxZoom, opt => opt.MapFrom(src => src.ContainsSingleSubsite ? 13 : 11))
                .ForMember(dest => dest.IconLoaderAction, opt => opt.MapFrom(src => src.Subsites.Count > 1 || src.Subsites[0].Photos.Count == 0 ?
                    null : MVC.Photos.ViewPhoto(src.Subsites[0].Photos[0].StaticId, PhotoSize.SmallMapSquare)))
                .ForMember(dest => dest.InfoLoaderAction, opt => opt.MapFrom(src => MVC.Map.SiteMarkerInfo(src.Id)));

            CreateMap<Model.Sites.Subsite, MapMarkerModel>()
                .ForMember(dest => dest.Title, opt => opt.MapFrom(src => src.Name))
                .ForMember(dest => dest.Position, opt => opt.MapFrom(src => src.CalculatedCoordinates))
                .ForMember(dest => dest.MinZoom, opt => opt.UseValue(12))
                .ForMember(dest => dest.MaxZoom, opt => opt.UseValue(13))
                .ForMember(dest => dest.DefaultIconUrl, opt => opt.UseValue(Links.images.icons.Subsite32_png))
                .ForMember(dest => dest.IconLoaderAction, opt => opt.MapFrom(src => src.Photos.Count == 0 ?
                    null : MVC.Photos.ViewPhoto(src.Photos[0].StaticId, PhotoSize.SmallMapSquare)))
                .ForMember(dest => dest.InfoLoaderAction, opt => opt.MapFrom(src => MVC.Map.SubsiteMarkerInfo(src.Site.Id, src.Id)));

            CreateMap<Model.Trees.Tree, MapMarkerModel>()
                .ForMember(dest => dest.Title, opt => opt.MapFrom(src => src.ScientificName))
                .ForMember(dest => dest.Position, opt => opt.MapFrom(src => src.CalculatedCoordinates))
                .ForMember(dest => dest.MinZoom, opt => opt.UseValue(14))
                .ForMember(dest => dest.MaxZoom, opt => opt.UseValue(30))
                .ForMember(dest => dest.DefaultIconUrl, opt => opt.UseValue(Links.images.icons.SingleTrunkTree32_png))
                .ForMember(dest => dest.IconLoaderAction, opt => opt.MapFrom(src => src.Photos.Count == 0 ?
                    null : MVC.Photos.ViewPhoto(src.Photos[0].StaticId, PhotoSize.SmallMapSquare)))
                .ForMember(dest => dest.InfoLoaderAction, opt => opt.MapFrom(src => MVC.Map.TreeMarkerInfo(src.Id)));
        }
    }
}