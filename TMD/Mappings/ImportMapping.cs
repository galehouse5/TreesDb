using AutoMapper;
using System.Linq;
using TMD.Model;
using TMD.Model.Extensions;
using TMD.Model.Imports;
using TMD.Model.Validation;
using TMD.Models;
using TMD.Models.Import;

namespace TMD.Mappings
{
    public class ImportMapping : Profile
    {
        protected override void Configure()
        {
            CreateMap<Trip, ImportTripSummaryModel>()
                   .ForMember(dest => dest.Sites, opt => opt.MapFrom(src => (from site in src.Sites select site.Name).ToList()));

            configureForTrip();
            configureForSites();
            configureForTrees();
            configureForFinish();
        }

        private void configureForTrip()
        {
            CreateMap<Trip, ImportTripModel>()
                .ForMember(dest => dest.FirstMeasurer, opt => opt.MapFrom(src => src.Measurers.Count > 0 ? src.Measurers[0].ToFormalName() : string.Empty))
                .ForMember(dest => dest.SecondMeasurer, opt => opt.MapFrom(src => src.Measurers.Count > 1 ? src.Measurers[1].ToFormalName() : string.Empty))
                .ForMember(dest => dest.ThirdMeasurer, opt => opt.MapFrom(src => src.Measurers.Count > 2 ? src.Measurers[2].ToFormalName() : string.Empty));
            ValidationMapper.CreateMap<Trip, ImportTripModel>()
                .ForPath("Measurers[0].FirstName", "FirstMeasurer").ForPath("Measurers[0].LastName", "FirstMeasurer").UseMessage("Measurers[0].*", "Name must be in Lastname, Firstname format.")
                .ForPath("Measurers[1].FirstName", "SecondMeasurer").ForPath("Measurers[1].LastName", "SecondMeasurer").UseMessage("Measurers[1].*", "Name must be in Lastname, Firstname format.")
                .ForPath("Measurers[2].FirstName", "ThirdMeasurer").ForPath("Measurers[2].LastName", "ThirdMeasurer").UseMessage("Measurers[2].*", "Name must be in Lastname, Firstname format.")
                .ForPath("Measurers", "FirstMeasurer").UseMessage("Measurers", "Name must be specified.");

            CreateMap<ImportTripModel, Trip>()
                .AfterMap((m, t) =>
                    {
                        int lastSpecifiedMeasurer = !string.IsNullOrWhiteSpace(m.ThirdMeasurer) ? 3
                            : !string.IsNullOrWhiteSpace(m.SecondMeasurer) ? 2
                            : !string.IsNullOrWhiteSpace(m.FirstMeasurer) ? 1 : 0;
                        while (t.Measurers.Count < lastSpecifiedMeasurer) { t.Measurers.Add(Name.Null()); }
                        while (t.Measurers.Count > lastSpecifiedMeasurer) { t.Measurers.RemoveAt(t.Measurers.Count -1); }
                        switch (lastSpecifiedMeasurer)
                        {
                            case 3 : t.Measurers[2] = Name.CreateFromFormalName(m.ThirdMeasurer); goto case 2;
                            case 2 : t.Measurers[1] = Name.CreateFromFormalName(m.SecondMeasurer); goto case 1;
                            case 1 : t.Measurers[0] = Name.CreateFromFormalName(m.FirstMeasurer); goto default;
                            default : break;
                        }
                    });
        }

        private void configureForSites()
        {
            CreateMap<Trip, ImportSitesModel>()
                .ForMember(dest => dest.Sites, opt => opt.MapFrom(src => src.Sites));
            ValidationMapper.CreateMap<Trip, ImportSitesModel>()
                .ForPath("*.Coordinates.*", "*.Coordinates").IgnorePath("Sites[*].Subsites[*].Trees*");

            CreateMap<Site, ImportSiteModel>()
                .ForMember(dest => dest.IsEditing, opt => opt.MapFrom(src => 
                    !ValidationMapper.Map<Site, ImportSiteModel>(src.Validate(ValidationTag.Screening, ValidationTag.Persistence)).IsValid()))
                .ForMember(dest => dest.IsSaveableAndRemovable, opt => opt.MapFrom(src => src.Trip.Sites.Count > 1))
                .ForMember(dest => dest.Coordinates, opt => opt.MapFrom(src => Mapper.Map<Site, CoordinatePickerModel>(src)));
            ValidationMapper.CreateMap<Site, ImportSiteModel>()
                .ForPath("*.Coordinates.*", "*.Coordinates").IgnorePath("Subsites[*].Trees*");

            CreateMap<Subsite, ImportSubsiteModel>()
                .ForMember(dest => dest.Photos, opt => opt.MapFrom(src => Mapper.Map<Subsite, ImportSubsitePhotoGalleryModel>(src)))
                .ForMember(dest => dest.Coordinates, opt => opt.MapFrom(src => Mapper.Map<Subsite, CoordinatePickerModel>(src)));

            CreateMap<ImportSitesModel, Trip>().ForMember(dest => dest.Sites, opt => opt.Ignore())
                .AfterMap((src, dest) => src.Sites.ForEach(s => Mapper.Map(s, dest.FindSiteById(s.Id))));

            CreateMap<ImportSiteModel, Site>().ForMember(dest => dest.Subsites, opt => opt.Ignore())
                .AfterMap((src, dest) => src.Subsites.ForEach(ss => Mapper.Map(ss, dest.FindSubsiteById(ss.Id))));

            CreateMap<ImportSubsiteModel, Subsite>()
                .ForMember(dest => dest.Photos, opt => opt.Ignore());
        }

        private void configureForTrees()
        {
            CreateMap<Trip, ImportTreesModel>()
                .ForMember(dest => dest.Sites, opt => opt.MapFrom(src => src.Sites));
            ValidationMapper.CreateMap<Trip, ImportTreesModel>()
                .ForPath("*.InputFormat", "*").ForPath("*.Feet", "*").ForPath("*.Latitude.*", "*").ForPath("*.Longitude.*", "*");

            CreateMap<Site, ImportSiteTreesModel>();
            CreateMap<Subsite, ImportSubsiteTreesModel>();

            CreateMap<TreeBase, ImportTreeModel>()
                .ForMember(dest => dest.IsEditing, opt => opt.MapFrom(src =>
                    !ValidationMapper.Map<TreeBase, ImportTreeModel>(src.Validate(ValidationTag.Screening, ValidationTag.Persistence)).IsValid()))
                .ForMember(dest => dest.IsRemovable, opt => opt.MapFrom(src => src.Subsite.Trees.Count > 1))
                .ForMember(dest => dest.Photos, opt => opt.MapFrom(src => Mapper.Map<TreeBase, ImportTreePhotoGalleryModel>(src)))
                .ForMember(dest => dest.Coordinates, opt => opt.MapFrom(src => Mapper.Map<TreeBase, CoordinatePickerModel>(src)));
            ValidationMapper.CreateMap<TreeBase, ImportTreeModel>()
                .ForPath("*.InputFormat", "*").ForPath("*.Feet", "*").ForPath("*.Latitude.*", "*").ForPath("*.Longitude.*", "*");

            CreateMap<ImportTreesModel, Trip>().ForMember(dest => dest.Sites, opt => opt.Ignore())
                .AfterMap((src, dest) => src.Sites.ForEach(s => Mapper.Map(s, dest.FindSiteById(s.Id))));

            CreateMap<ImportSiteTreesModel, Site>().ForMember(dest => dest.Subsites, opt => opt.Ignore())
                .AfterMap((src, dest) => src.Subsites.ForEach(ss => Mapper.Map(ss, dest.FindSubsiteById(ss.Id))));

            CreateMap<ImportSubsiteTreesModel, Subsite>().ForMember(dest => dest.Trees, opt => opt.Ignore())
                .AfterMap((src, dest) => src.Trees.ForEach(t => Mapper.Map(t, dest.FindTreeById(t.Id))));

            CreateMap<ImportTreeModel, TreeBase>()
                .ForMember(dest => dest.Photos, opt => opt.Ignore());
        }

        public void configureForFinish()
        {
            CreateMap<Trip, ImportFinishedTripModel>()
                .ForMember(dest => dest.FirstMeasurer, opt => opt.MapFrom(src => src.Measurers.Count > 0 ? src.Measurers[0].ToFormalName() : string.Empty))
                .ForMember(dest => dest.SecondMeasurer, opt => opt.MapFrom(src => src.Measurers.Count > 1 ? src.Measurers[1].ToFormalName() : string.Empty))
                .ForMember(dest => dest.ThirdMeasurer, opt => opt.MapFrom(src => src.Measurers.Count > 2 ? src.Measurers[2].ToFormalName() : string.Empty))
                .ForMember(dest => dest.Sites, opt => opt.MapFrom(src => src.Sites));

            CreateMap<Site, ImportFinishedSiteModel>();

            CreateMap<Subsite, ImportFinishedSubsiteModel>()
                .ForMember(dest => dest.Photos, opt => opt.MapFrom(src => Mapper.Map<Subsite, ImportSubsitePhotoGalleryModel>(src)));

            CreateMap<TreeBase, ImportFinishedTreeModel>()
                .ForMember(dest => dest.Photos, opt => opt.MapFrom(src => Mapper.Map<TreeBase, ImportTreePhotoGalleryModel>(src)));
        }
    }
}