using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using AutoMapper;
using TMD.Model.Imports;
using TMD.Models;
using TMD.Model.Photos;
using TMD.Model;

namespace TMD.Mappings
{
    public class MapMapping : Profile
    {
        protected override void Configure()
        {
            CreateMap<CoordinatePickerModel, Coordinates>()
                .ForMember(dest => dest.Latitude, opt => opt.MapFrom(src => src.Coordinates.Latitude.Clone() as Latitude))
                .ForMember(dest => dest.Longitude, opt => opt.MapFrom(src => src.Coordinates.Longitude.Clone() as Longitude));

            CreateMap<TreeBase, ImportTreeCoordinatePickerModel>()
                .ForMember(dest => dest.TreeId, opt => opt.MapFrom(src => src.Id))
                .ForMember(dest => dest.TripId, opt => opt.MapFrom(src => src.Subsite.Site.Trip.Id));
            CreateMap<TreeBase, MapImportTreeMarkerModel>();

            CreateMap<Subsite, ImportSubsiteCoordinatePickerModel>()
                .ForMember(dest => dest.SubsiteId, opt => opt.MapFrom(src => src.Id))
                .ForMember(dest => dest.TripId, opt => opt.MapFrom(src => src.Site.Trip.Id));
            CreateMap<Subsite, MapImportSubsiteMarkerModel>();

            CreateMap<Site, ImportSiteCoordinatePickerModel>()
                .ForMember(dest => dest.SiteId, opt => opt.MapFrom(src => src.Id))
                .ForMember(dest => dest.TripId, opt => opt.MapFrom(src => src.Trip.Id));
            CreateMap<Site, MapImportSiteMarkerModel>();

            CreateMap<Model.Sites.Site, MapSiteMarkerModel>()
                .ForMember(dest => dest.State, opt => opt.MapFrom(src => src.Subsites[0].State))
                .ForMember(dest => dest.County, opt => opt.MapFrom(src => src.Subsites[0].County))
                .ForMember(dest => dest.OwnershipType, opt => opt.MapFrom(src => src.Subsites[0].OwnershipType))
                .ForMember(dest => dest.Photos, opt => opt.MapFrom(src => src.Subsites[0].Photos));

            CreateMap<Model.Sites.Subsite, MapSubsiteMarkerModel>();

            CreateMap<Model.Trees.Tree, MapTreeMarkerModel>();
        }
    }
}