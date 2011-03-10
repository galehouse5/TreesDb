﻿using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using AutoMapper;
using TMD.Models;
using TMD.Model.Photos;
using TMD.Model;
using TMD.Model.Trees;
using TMD.Model.Extensions;
using TMD.Model.Sites;

namespace TMD.Mappings
{
    public class BrowseMapping : Profile
    {
        protected override void Configure()
        {
            configureForTrees();
            configureForSpecies();
            configureForSubsites();
        }

        private void configureForTrees()
        {
            CreateMap<Measurement, BrowsePhotoSumaryModel>()
                .ForMember(dest => dest.Date, opt => opt.MapFrom(src => src.Measured))
                .ForMember(dest => dest.Photographers, opt => opt.MapFrom(src => src.Measurers));

            CreateMap<Tree, BrowseTreeDetailsModel>()
                .ForMember(dest => dest.GeneralComments, opt => opt.MapFrom(src => src.LastMeasurement.GeneralComments))
                .ForMember(dest => dest.Measured, opt => opt.MapFrom(src => src.LastMeasured));

            CreateMap<Measurement, BrowseTreeDetailsModel>();

            CreateMap<Tree, BrowseTreeLocationModel>()
                .ForMember(dest => dest.Map, opt => opt.MapFrom(src => Mapper.Map<Tree, MapModel>(src)));

            CreateMap<Site, BrowseTreeLocationModel>()
                .ForMember(dest => dest.SiteId, opt => opt.MapFrom(src => src.Id))
                .ForMember(dest => dest.SiteName, opt => opt.MapFrom(src => src.Name))
                .ForMember(dest => dest.SiteSubsitesCount, opt => opt.MapFrom(src => src.Subsites.Count))
                .ForMember(dest => dest.Id, opt => opt.Ignore())
                .ForMember(dest => dest.Coordinates, opt => opt.Ignore())
                .ForMember(dest => dest.CalculatedCoordinates, opt => opt.Ignore());

            CreateMap<Subsite, BrowseTreeLocationModel>()
                .ForMember(dest => dest.SubsiteId, opt => opt.MapFrom(src => src.Id))
                .ForMember(dest => dest.SubsiteName, opt => opt.MapFrom(src => src.Name))
                .ForMember(dest => dest.Id, opt => opt.Ignore())
                .ForMember(dest => dest.Coordinates, opt => opt.Ignore())
                .ForMember(dest => dest.CalculatedCoordinates, opt => opt.Ignore());
        }

        private void configureForSpecies()
        {
            CreateMap<MeasuredSpecies, BrowseSpeciesModel>();

            CreateMap<IList<StateMeasuredSpecies>, BrowseSpeciesModel>()
                .ForMember(dest => dest.MeasuredSpeciesByState, opt => opt.MapFrom(src => src));
        }

        private void configureForSubsites()
        {
            CreateMap<SubsiteVisit, BrowsePhotoSumaryModel>()
                .ForMember(dest => dest.Date, opt => opt.MapFrom(src => src.Visited))
                .ForMember(dest => dest.Photographers, opt => opt.MapFrom(src => src.Visitors));

            CreateMap<Subsite, BrowseSubsiteDetailsModel>();

            CreateMap<Subsite, BrowseSubsiteLocationModel>()
                .ForMember(dest => dest.Map, opt => opt.MapFrom(src => Mapper.Map<Subsite, MapModel>(src)));
        }
    }
}