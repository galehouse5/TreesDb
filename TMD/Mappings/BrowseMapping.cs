using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using AutoMapper;
using TMD.Model.Imports;
using TMD.Models;
using TMD.Model.Photos;
using TMD.Model;
using TMD.Model.Trees;
using TMD.Model.Extensions;

namespace TMD.Mappings
{
    public class BrowseMapping : Profile
    {
        protected override void Configure()
        {
            CreateMap<Measurement, BrowsePhotoSumaryModel>()
                .ForMember(dest => dest.Date, opt => opt.MapFrom(src => src.Measured))
                .ForMember(dest => dest.Photographers, opt => opt.MapFrom(src => src.Measurers));

            CreateMap<Measurement, BrowseMeasurementSummaryModel>();

            CreateMap<Tree, BrowseTreeDetailsModel>()
                .ForMember(dest => dest.GeneralComments, opt => opt.MapFrom(src => src.Measurements[0].GeneralComments));

            CreateMap<Tree, BrowseTreeModel>()
                .ForMember(dest => dest.Details, opt => opt.MapFrom(src => src))
                .ForMember(dest => dest.MeasurementSummaries, opt => opt.MapFrom(src => src.Measurements))
                .ForMember(dest => dest.PhotoSummaries, opt => opt.MapFrom(src => src.Measurements))
                .AfterMap((src, dest) => dest.PhotoSummaries.RemoveAll(ps => ps.Photos.Count == 0));
        }
    }
}