using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using AutoMapper;
using TMD.Model.Trips;
using TMD.Models;
using TMD.Model.Photos;

namespace TMD.Mappings
{
    public class PhotoMapping : Profile
    {
        protected override void Configure()
        {
            CreateMap<TreeMeasurementBase, PhotoGalleryModel>()
                .ForMember(dest => dest.Adder, opt => opt.MapFrom(src =>
                    new ImportTreePhotoAdderModel { TripId = src.SubsiteVisit.SiteVisit.Trip.Id, TreeId = src.Id }))
                .ForMember(dest => dest.Photos, opt => opt.MapFrom(src =>
                    src.Photos.Select(photo => new PhotoModel { Id = src.Id })));
        }
    }
}