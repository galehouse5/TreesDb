using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using AutoMapper;
using TMD.Model.Imports;
using TMD.Models;
using TMD.Model.Photos;

namespace TMD.Mappings
{
    public class PhotoMapping : Profile
    {
        protected override void Configure()
        {
            CreateMap<TreeBase, ImportTreePhotoGalleryModel>()
                .ForMember(dest => dest.TreeId, opt => opt.MapFrom(src => src.Id))
                .ForMember(dest => dest.TripId, opt => opt.MapFrom(src => src.Subsite.Site.Trip.Id));
            ValidationMapper.CreateMap<TreeBase, PhotoGalleryModel>()
                .IgnorePath("*").ForPath("Photo*", "AddPhotoActionName");

            CreateMap<Subsite, ImportSubsitePhotoGalleryModel>()
                .ForMember(dest => dest.SubsiteId, opt => opt.MapFrom(src => src.Id))
                .ForMember(dest => dest.TripId, opt => opt.MapFrom(src => src.Site.Trip.Id));
            ValidationMapper.CreateMap<Subsite, PhotoGalleryModel>()
                .IgnorePath("*").ForPath("Photo*", "AddPhotoActionName");
        }
    }
}