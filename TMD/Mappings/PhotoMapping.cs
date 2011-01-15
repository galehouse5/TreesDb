﻿using System;
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
            CreateMap<TreeBase, PhotoGalleryModel>()
                .ForMember(dest => dest.Adder, opt => opt.MapFrom(src =>
                    new ImportTreePhotoGalleryAdderModel { TripId = src.Subsite.Site.Trip.Id, TreeId = src.Id }))
                .ForMember(dest => dest.Photos, opt => opt.MapFrom(src =>
                    src.PhotoLinks.Select(link => new PhotoModel { Id = link.Photo.Id })));
            ValidationMapper.CreateMap<TreeBase, PhotoGalleryModel>()
                .IgnorePath("*").ForPath("Photo*", "Adder");

            CreateMap<Subsite, PhotoGalleryModel>()
                .ForMember(dest => dest.Adder, opt => opt.MapFrom(src =>
                    new ImportSubsitePhotoGalleryAdderModel { TripId = src.Site.Trip.Id, SubsiteId = src.Id }))
                .ForMember(dest => dest.Photos, opt => opt.MapFrom(src =>
                    src.PhotoLinks.Select(link => new PhotoModel { Id = link.Photo.Id })));
            ValidationMapper.CreateMap<Subsite, PhotoGalleryModel>()
                .IgnorePath("*").ForPath("Photo*", "Adder");
        }
    }
}