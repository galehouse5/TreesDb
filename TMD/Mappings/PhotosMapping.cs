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
                .ForMember(dest => dest.TripId, opt => opt.MapFrom(src => src.Subsite.Site.Trip.Id));
            ValidationMapper.CreateMap<Model.Imports.TreeBase, PhotoGalleryModel>()
                .IgnorePath("*").ForPath("Photo*", "AddPhotoActionName");

            CreateMap<Model.Imports.Subsite, ImportSubsitePhotoGalleryModel>()
                .ForMember(dest => dest.SubsiteId, opt => opt.MapFrom(src => src.Id))
                .ForMember(dest => dest.TripId, opt => opt.MapFrom(src => src.Site.Trip.Id));
            ValidationMapper.CreateMap<Model.Imports.Subsite, PhotoGalleryModel>()
                .IgnorePath("*").ForPath("Photo*", "AddPhotoActionName");

            CreateMap<PhotoReferenceBase, PhotoCaptionModel>()
                .Include<TreeMeasurementPhotoReference, TreePhotoCaptionModel>()
                .Include<SubsiteVisitPhotoReference, SubsitePhotoCaptionModel>()
                .Include<TreePhotoReference, TreePhotoCaptionModel>()
                .Include<SubsitePhotoReference, SubsitePhotoCaptionModel>()
                .Include<Model.Imports.SubsitePhotoReference, EmptyContextPhotoCaptionModel>()
                .Include<Model.Imports.TreePhotoReference, EmptyContextPhotoCaptionModel>();

            CreateMap<TreeMeasurementPhotoReference, TreePhotoCaptionModel>()
                .ForMember(dest => dest.BotanicalName, opt => opt.MapFrom(src => src.TreeMeasurement.ScientificName))
                .ForMember(dest => dest.TreeId, opt => opt.MapFrom(src => src.TreeMeasurement.Tree.Id))
                .ForMember(dest => dest.SiteName, opt => opt.MapFrom(src => src.TreeMeasurement.Tree.Subsite.Site.Name))
                .ForMember(dest => dest.SiteId, opt => opt.MapFrom(src => src.TreeMeasurement.Tree.Subsite.Site.Id))
                .ForMember(dest => dest.StateName, opt => opt.MapFrom(src => src.TreeMeasurement.Tree.Subsite.State.Name))
                .ForMember(dest => dest.StateId, opt => opt.MapFrom(src => src.TreeMeasurement.Tree.Subsite.State.Id));

            CreateMap<TreePhotoReference, TreePhotoCaptionModel>()
                .ForMember(dest => dest.BotanicalName, opt => opt.MapFrom(src => src.Tree.ScientificName))
                .ForMember(dest => dest.TreeId, opt => opt.MapFrom(src => src.Tree.Id))
                .ForMember(dest => dest.SiteName, opt => opt.MapFrom(src => src.Tree.Subsite.Site.Name))
                .ForMember(dest => dest.SiteId, opt => opt.MapFrom(src => src.Tree.Subsite.Site.Id))
                .ForMember(dest => dest.StateName, opt => opt.MapFrom(src => src.Tree.Subsite.State.Name))
                .ForMember(dest => dest.StateId, opt => opt.MapFrom(src => src.Tree.Subsite.State.Id));

            CreateMap<SubsiteVisitPhotoReference, SubsitePhotoCaptionModel>()
                .ForMember(dest => dest.SiteName, opt => opt.MapFrom(src => src.SubsiteVisit.Subsite.Site.Name))
                .ForMember(dest => dest.SiteId, opt => opt.MapFrom(src => src.SubsiteVisit.Subsite.Site.Id))
                .ForMember(dest => dest.StateName, opt => opt.MapFrom(src => src.SubsiteVisit.Subsite.State.Name))
                .ForMember(dest => dest.StateId, opt => opt.MapFrom(src => src.SubsiteVisit.Subsite.State.Id));

            CreateMap<SubsitePhotoReference, SubsitePhotoCaptionModel>()
                .ForMember(dest => dest.SiteName, opt => opt.MapFrom(src => src.Subsite.Site.Name))
                .ForMember(dest => dest.SiteId, opt => opt.MapFrom(src => src.Subsite.Site.Id))
                .ForMember(dest => dest.StateName, opt => opt.MapFrom(src => src.Subsite.State.Name))
                .ForMember(dest => dest.StateId, opt => opt.MapFrom(src => src.Subsite.State.Id));

            CreateMap<Model.Imports.SubsitePhotoReference, EmptyContextPhotoCaptionModel>();
            CreateMap<Model.Imports.TreePhotoReference, EmptyContextPhotoCaptionModel>();
        }
    }
}