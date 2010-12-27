using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using AutoMapper;
using TMD.Model.Trips;
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

            CreateMap<TreeMeasurementBase, CoordinatePickerModel>()
                .ForMember(dest => dest.Coordinates, opt => opt.MapFrom(src => src.Coordinates))
                .ForMember(dest => dest.MapLoader, opt => opt.MapFrom(src =>
                    new ImportTreeCoordinatePickerMapLoaderModel { TreeId = src.Id, TripId = src.SubsiteVisit.SiteVisit.Trip.Id }));

            CreateMap<SubsiteVisit, CoordinatePickerModel>()
                .ForMember(dest => dest.Coordinates, opt => opt.MapFrom(src => src.Coordinates))
                .ForMember(dest => dest.MapLoader, opt => opt.MapFrom(src =>
                    new ImportSubsiteCoordinatePickerMapLoaderModel { SubsiteId = src.Id, TripId = src.SiteVisit.Trip.Id }));

            CreateMap<SiteVisit, CoordinatePickerModel>()
                .ForMember(dest => dest.Coordinates, opt => opt.MapFrom(src => src.Coordinates))
                .ForMember(dest => dest.MapLoader, opt => opt.MapFrom(src =>
                    new ImportSiteCoordinatePickerMapLoaderModel { SiteId = src.Id, TripId = src.Trip.Id }));
        }
    }
}