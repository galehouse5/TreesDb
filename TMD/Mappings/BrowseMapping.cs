using AutoMapper;
using TMD.Model.Locations;
using TMD.Model.Sites;
using TMD.Model.Trees;
using TMD.Models;
using TMD.Models.Browse;
using TMD.Models.Map;

namespace TMD.Mappings
{
    public class BrowseMapping : Profile
    {
        protected override void Configure()
        {
            configureForTrees();
            configureForSpecies();
            configureForSites();
            configureForStates();
        }

        private void configureForTrees()
        {
            CreateMap<Measurement, BrowsePhotoSumaryModel>()
                .ForMember(dest => dest.Date, opt => opt.MapFrom(src => src.Measured))
                .ForMember(dest => dest.Photographers, opt => opt.MapFrom(src => src.Measurers));

            CreateMap<Tree, BrowseTreeDetailsModel>()
                .ForMember(dest => dest.SiteId, opt => opt.MapFrom(src => src.Site.Id))
                .ForMember(dest => dest.GeneralComments, opt => opt.MapFrom(src => src.LastMeasurement.GeneralComments))
                .ForMember(dest => dest.Measured, opt => opt.MapFrom(src => src.LastMeasured));

            CreateMap<Measurement, BrowseTreeDetailsModel>();

            CreateMap<Tree, BrowseTreeLocationModel>()
                .ForMember(dest => dest.Map, opt => opt.MapFrom(src => Mapper.Map<Tree, MapModel>(src)));

            CreateMap<Site, BrowseTreeLocationModel>()
                .ForMember(dest => dest.SiteId, opt => opt.MapFrom(src => src.Id))
                .ForMember(dest => dest.SiteName, opt => opt.MapFrom(src => src.Name))
                .ForMember(dest => dest.Id, opt => opt.Ignore())
                .ForMember(dest => dest.Coordinates, opt => opt.Ignore())
                .ForMember(dest => dest.CalculatedCoordinates, opt => opt.Ignore());
        }

        private void configureForSpecies()
        {
            CreateMap<GlobalMeasuredSpecies, BrowseSpeciesDetailsModel>();

            CreateMap<StateMeasuredSpecies, BrowseSpeciesStateDetailsModel>();

            CreateMap<SiteMeasuredSpecies, BrowseSpeciesSiteDetailsModel>()
                .ForMember(dest => dest.County, opt => opt.MapFrom(src => src.Site.County))
                .ForMember(dest => dest.OwnershipType, opt => opt.MapFrom(src => src.Site.OwnershipType));
        }

        private void configureForSites()
        {
            CreateMap<SiteVisit, BrowsePhotoSumaryModel>()
                .ForMember(dest => dest.Date, opt => opt.MapFrom(src => src.Visited))
                .ForMember(dest => dest.Photographers, opt => opt.MapFrom(src => src.Visitors));

            CreateMap<Site, BrowseSiteDetailsModel>()
                .ForMember(dest => dest.LastVisitComments, opt => opt.MapFrom(src => src.LastVisit.Comments))
                .ForGeoAreaMetricsMembers();

            CreateMap<Site, BrowseSiteLocationModel>()
                .ForMember(dest => dest.Map, opt => opt.MapFrom(src => Mapper.Map<Site, MapModel>(src)));

            CreateMap<SiteVisit, BrowseSiteVisitModel>();
        }

        private void configureForStates()
        {
            CreateMap<State, BrowseStateModel>()
                .ForMember(dest => dest.Coordinates, opt => opt.MapFrom(src => src.CoordinateBounds.Center))
                .ForGeoAreaMetricsMembers();
        }
    }
}