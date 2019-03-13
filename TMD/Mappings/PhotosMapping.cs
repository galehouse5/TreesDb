using AutoMapper;
using TMD.Model.Photos;
using TMD.Model.Sites;
using TMD.Model.Trees;
using TMD.Models;

namespace TMD.Mappings
{
    public class PhotosMapping : Profile
    {
        protected override void Configure()
        {
            CreateMap<Model.Imports.TreeBase, ImportTreePhotoGalleryModel>()
                .ForMember(dest => dest.TreeId, opt => opt.MapFrom(src => src.Id))
                .ForMember(dest => dest.TripId, opt => opt.MapFrom(src => src.Site.Trip.Id));
            ValidationMapper.CreateMap<Model.Imports.TreeBase, PhotoGalleryModel>()
                .IgnorePath("*").ForPath("Photo*", "AddPhotoActionName");

            CreateMap<Model.Imports.Site, ImportSitePhotoGalleryModel>()
                .ForMember(dest => dest.SiteId, opt => opt.MapFrom(src => src.Id))
                .ForMember(dest => dest.TripId, opt => opt.MapFrom(src => src.Trip.Id));
            ValidationMapper.CreateMap<Model.Imports.Site, PhotoGalleryModel>()
                .IgnorePath("*").ForPath("Photo*", "AddPhotoActionName");

            CreateMap<PhotoReferenceBase, PhotoCaptionModel>()
                .Include<TreeMeasurementPhotoReference, TreePhotoCaptionModel>()
                .Include<SiteVisitPhotoReference, SitePhotoCaptionModel>()
                .Include<TreePhotoReference, TreePhotoCaptionModel>()
                .Include<SitePhotoReference, SitePhotoCaptionModel>()
                .Include<Model.Imports.SitePhotoReference, EmptyContextPhotoCaptionModel>()
                .Include<Model.Imports.TreePhotoReference, EmptyContextPhotoCaptionModel>();

            CreateMap<TreeMeasurementPhotoReference, TreePhotoCaptionModel>()
                .ForMember(dest => dest.BotanicalName, opt => opt.MapFrom(src => src.TreeMeasurement.ScientificName))
                .ForMember(dest => dest.TreeId, opt => opt.MapFrom(src => src.TreeMeasurement.Tree.Id))
                .ForMember(dest => dest.SiteName, opt => opt.MapFrom(src => src.TreeMeasurement.Tree.Site.Name))
                .ForMember(dest => dest.SiteId, opt => opt.MapFrom(src => src.TreeMeasurement.Tree.Site.Id))
                .ForMember(dest => dest.StateName, opt => opt.MapFrom(src => src.TreeMeasurement.Tree.Site.State.Name))
                .ForMember(dest => dest.StateId, opt => opt.MapFrom(src => src.TreeMeasurement.Tree.Site.State.Id));

            CreateMap<TreePhotoReference, TreePhotoCaptionModel>()
                .ForMember(dest => dest.BotanicalName, opt => opt.MapFrom(src => src.Tree.ScientificName))
                .ForMember(dest => dest.TreeId, opt => opt.MapFrom(src => src.Tree.Id))
                .ForMember(dest => dest.SiteName, opt => opt.MapFrom(src => src.Tree.Site.Name))
                .ForMember(dest => dest.SiteId, opt => opt.MapFrom(src => src.Tree.Site.Id))
                .ForMember(dest => dest.StateName, opt => opt.MapFrom(src => src.Tree.Site.State.Name))
                .ForMember(dest => dest.StateId, opt => opt.MapFrom(src => src.Tree.Site.State.Id));

            CreateMap<SiteVisitPhotoReference, SitePhotoCaptionModel>()
                .ForMember(dest => dest.SiteName, opt => opt.MapFrom(src => src.SiteVisit.Site.Name))
                .ForMember(dest => dest.SiteId, opt => opt.MapFrom(src => src.SiteVisit.Site.Id))
                .ForMember(dest => dest.StateName, opt => opt.MapFrom(src => src.SiteVisit.Site.State.Name))
                .ForMember(dest => dest.StateId, opt => opt.MapFrom(src => src.SiteVisit.Site.State.Id));

            CreateMap<SitePhotoReference, SitePhotoCaptionModel>()
                .ForMember(dest => dest.SiteName, opt => opt.MapFrom(src => src.Site.Name))
                .ForMember(dest => dest.SiteId, opt => opt.MapFrom(src => src.Site.Id))
                .ForMember(dest => dest.StateName, opt => opt.MapFrom(src => src.Site.State.Name))
                .ForMember(dest => dest.StateId, opt => opt.MapFrom(src => src.Site.State.Id));

            CreateMap<Model.Imports.SitePhotoReference, EmptyContextPhotoCaptionModel>();
            CreateMap<Model.Imports.TreePhotoReference, EmptyContextPhotoCaptionModel>();
        }
    }
}