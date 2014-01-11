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
                .ForMember(dest => dest.MarkerLoader, opt => opt.MapFrom(src => new ActionLoader("SiteMarker", "Map", new { id = src.Id })));

            CreateMap<Model.Sites.Subsite, MapModel>()
                .ForMember(dest => dest.Zoom, opt => opt.UseValue(13))
                .ForMember(dest => dest.Center, opt => opt.MapFrom(src => src.CalculatedCoordinates))
                .ForMember(dest => dest.MarkerLoader, opt => opt.MapFrom(src => new ActionLoader("SubsiteMarker", "Map", new { id = src.Site.Id, subsiteId = src.Id })));

            CreateMap<Model.Trees.Tree, MapModel>()
                .ForMember(dest => dest.Zoom, opt => opt.UseValue(30))
                .ForMember(dest => dest.Center, opt => opt.MapFrom(src => src.CalculatedCoordinates))
                .ForMember(dest => dest.MarkerLoader, opt => opt.MapFrom(src => new ActionLoader("TreeMarker", "Map", new { id = src.Id })));

            CreateMap<IEnumerable<Model.Sites.Site>, MapModel>()
                .ForMember(dest => dest.Bounds, opt => opt.MapFrom(src => CoordinateBounds.Create(from site in src select site.Coordinates)))
                .ForMember(dest => dest.MarkerLoader, opt => opt.MapFrom(src => new ActionLoader("AllMarkers", "Map")));
        }

        private void configureForMarkers()
        {
            CreateMap<Model.Sites.Site, MapMarkerModel>()
                .ForMember(dest => dest.Title, opt => opt.MapFrom(src => src.Name))
                .ForMember(dest => dest.Position, opt => opt.MapFrom(src => src.CalculatedCoordinates))
                .ForMember(dest => dest.DefaultIconUrl, opt => opt.UseValue("~/images/icons/Site32.png"))
                .ForMember(dest => dest.MinZoom, opt => opt.UseValue(0))
                .ForMember(dest => dest.MaxZoom, opt => opt.MapFrom(src => src.ContainsSingleSubsite ? 13 : 11))
                .ForMember(dest => dest.IconLoader, opt => opt.MapFrom(src => src.Subsites.Count > 1 || src.Subsites[0].Photos.Count == 0 ?
                    null : new ActionLoader("View", "Photos", new { id = src.Subsites[0].Photos[0].StaticId, size = PhotoSize.SmallMapSquare })))
                .ForMember(dest => dest.InfoLoader, opt => opt.MapFrom(src => new ActionLoader("SiteMarkerInfo", "Map", new { id = src.Id })));

            CreateMap<Model.Sites.Subsite, MapMarkerModel>()
                .ForMember(dest => dest.Title, opt => opt.MapFrom(src => src.Name))
                .ForMember(dest => dest.Position, opt => opt.MapFrom(src => src.CalculatedCoordinates))
                .ForMember(dest => dest.MinZoom, opt => opt.UseValue(12))
                .ForMember(dest => dest.MaxZoom, opt => opt.UseValue(13))
                .ForMember(dest => dest.DefaultIconUrl, opt => opt.UseValue("~/images/icons/Subsite32.png"))
                .ForMember(dest => dest.IconLoader, opt => opt.MapFrom(src => src.Photos.Count == 0 ?
                    null : new ActionLoader("View", "Photos", new { id = src.Photos[0].StaticId, size = PhotoSize.SmallMapSquare })))
                .ForMember(dest => dest.InfoLoader, opt => opt.MapFrom(src => new ActionLoader("SubsiteMarkerInfo", "Map", new { id = src.Site.Id, subsiteId = src.Id })));

            CreateMap<Model.Trees.Tree, MapMarkerModel>()
                .ForMember(dest => dest.Title, opt => opt.MapFrom(src => src.ScientificName))
                .ForMember(dest => dest.Position, opt => opt.MapFrom(src => src.CalculatedCoordinates))
                .ForMember(dest => dest.MinZoom, opt => opt.UseValue(14))
                .ForMember(dest => dest.MaxZoom, opt => opt.UseValue(30))
                .ForMember(dest => dest.DefaultIconUrl, opt => opt.UseValue("~/images/icons/SingleTrunkTree32.png"))
                .ForMember(dest => dest.IconLoader, opt => opt.MapFrom(src => src.Photos.Count == 0 ?
                    null : new ActionLoader("View", "Photos", new { id = src.Photos[0].StaticId, size = PhotoSize.SmallMapSquare })))
                .ForMember(dest => dest.InfoLoader, opt => opt.MapFrom(src => new ActionLoader("TreeMarkerInfo", "Map", new { id = src.Id })));
        }
    }
}