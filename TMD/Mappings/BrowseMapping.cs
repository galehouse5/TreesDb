using System;
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
        }

        private void configureForTrees()
        {
            CreateMap<Measurement, BrowsePhotoSumaryModel>()
                .ForMember(dest => dest.Date, opt => opt.MapFrom(src => src.Measured))
                .ForMember(dest => dest.Photographers, opt => opt.MapFrom(src => src.Measurers));

            CreateMap<Measurement, BrowseMeasurementSummaryModel>();

            CreateMap<Tree, BrowseTreeDetailsModel>()
                .ForMember(dest => dest.GeneralComments, opt => opt.MapFrom(src => src.LastMeasurement.GeneralComments));

            CreateMap<Tree, BrowseTreeLocationModel>()
                .ForMember(dest => dest.Map, opt => opt.MapFrom(src => Mapper.Map<Tree, MapModel>(src)));

            CreateMap<Site, BrowseTreeLocationModel>()
                .ForMember(dest => dest.SiteId, opt => opt.MapFrom(src => src.Id))
                .ForMember(dest => dest.SiteName, opt => opt.MapFrom(src => src.Name))
                .ForMember(dest => dest.SiteComments, opt => opt.MapFrom(src => src.LastVisit.Comments))
                .ForMember(dest => dest.SiteSubsitesCount, opt => opt.MapFrom(src => src.Subsites.Count))
                .ForMember(dest => dest.Id, opt => opt.Ignore());

            CreateMap<Subsite, BrowseTreeLocationModel>()
                .ForMember(dest => dest.SubsiteId, opt => opt.MapFrom(src => src.Id))
                .ForMember(dest => dest.SubsiteName, opt => opt.MapFrom(src => src.Name))
                .ForMember(dest => dest.SubsiteComments, opt => opt.MapFrom(src => src.LastVisit.Comments))
                .ForMember(dest => dest.Id, opt => opt.Ignore());

            CreateMap<Tree, BrowseTreeModel>()
                .ForMember(dest => dest.Details, opt => opt.MapFrom(src => src))
                .ForMember(dest => dest.MeasurementSummaries, opt => opt.MapFrom(src => (from measurement in src.Measurements
                                                                                         orderby measurement.Measured descending
                                                                                         select measurement)))
                .ForMember(dest => dest.PhotoSummaries, opt => opt.MapFrom(src => (from measurement in src.Measurements
                                                                                   orderby measurement.Measured descending
                                                                                   select measurement)))
                .ForMember(dest => dest.Location, opt => opt.MapFrom(src => src))
                .AfterMap((src, dest) => dest.PhotoSummaries.RemoveAll(ps => ps.Photos.Count == 0));
        }
    }
}