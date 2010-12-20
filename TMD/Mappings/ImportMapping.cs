using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using AutoMapper;
using TMD.Model.Trips;
using TMD.Models;
using TMD.Model.Photos;
using TMD.Model;
using TMD.Model.Validation;
using TMD.Model.Extensions;

namespace TMD.Mappings
{
    public class ImportMapping : Profile
    {
        protected override void Configure()
        {
            configureForTrip();
            configureForSites();
        }

        private void configureForTrip()
        {
            CreateMap<Trip, ImportTripModel>()
                .AfterMap((t, m) =>
                    {
                        m.FirstMeasurer = t.Measurers.Count > 0 ? t.Measurers[0].ToFormalName() : string.Empty;
                        m.SecondMeasurer = t.Measurers.Count > 1 ? t.Measurers[1].ToFormalName() : string.Empty;
                        m.ThirdMeasurer = t.Measurers.Count > 2 ? t.Measurers[2].ToFormalName() : string.Empty;
                    });
            ValidationMapper.CreateMap<Trip, ImportTripModel>()
                .ForPath("Measurers[0].FirstName", "FirstMeasurer").ForPath("Measurers[0].LastName", "FirstMeasurer").UseMessage("Measurers[0].*", "Name must be specified.")
                .ForPath("Measurers[1].FirstName", "SecondMeasurer").ForPath("Measurers[1].LastName", "SecondMeasurer").UseMessage("Measurers[1].*", "Name must be specified.")
                .ForPath("Measurers[2].FirstName", "ThirdMeasurer").ForPath("Measurers[2].LastName", "ThirdMeasurer").UseMessage("Measurers[2].*", "Name must be specified.")
                .ForPath("Measurers", "FirstMeasurer").UseMessage("Measurers", "Name must be specified.");

            CreateMap<ImportTripModel, Trip>()
                .AfterMap((m, t) =>
                    {
                        int lastSpecifiedMeasurer = !string.IsNullOrWhiteSpace(m.ThirdMeasurer) ? 3
                            : !string.IsNullOrWhiteSpace(m.SecondMeasurer) ? 2
                            : !string.IsNullOrWhiteSpace(m.FirstMeasurer) ? 1 : 0;
                        while (t.Measurers.Count < lastSpecifiedMeasurer) { t.AddMeasurer(); }
                        while (t.Measurers.Count > lastSpecifiedMeasurer) { t.RemoveMeasurer(t.Measurers[t.Measurers.Count - 1]); }
                        switch (lastSpecifiedMeasurer)
                        {
                            case 3 : t.Measurers[2].FromFormalName(m.ThirdMeasurer); goto case 2;
                            case 2 : t.Measurers[1].FromFormalName(m.SecondMeasurer); goto case 1;
                            case 1 : t.Measurers[0].FromFormalName(m.FirstMeasurer); goto default;
                            default : break;
                        }
                    });
        }

        private void configureForSites()
        {
            CreateMap<Trip, ImportSitesModel>()
                .ForMember(dest => dest.Sites, opt => opt.MapFrom(src => src.SiteVisits));
            ValidationMapper.CreateMap<Trip, ImportSitesModel>()
                .ForPath("SiteVisits*", "Sites*")
                .ForPath("SiteVisits[*].Coordinates*", "Sites[*].Coordinates")
                .ForPath("SiteVisits[*].SubsiteVisits*", "Sites[*].Subsites*")
                .ForPath("SiteVisits[*].SubsiteVisits[*].Coordinates*", "Sites[*].Subsites[*].Coordinates")
                .IgnorePath("SiteVisits[*].SubsiteVisits[*].TreeMeasurements");

            CreateMap<SiteVisit, ImportSiteModel>()
                .ForMember(dest => dest.IsEditing, opt => opt.MapFrom(src => 
                    {
                        return !ValidationMapper.Map<SiteVisit, ImportSiteModel>(
                            src.Validate(Tag.Screening, Tag.Persistence)).IsValid();
                    }))
                .ForMember(dest => dest.Subsites, opt => opt.MapFrom(src => src.SubsiteVisits))
                .ForMember(dest => dest.IsSaveableAndRemovable, opt => opt.MapFrom(src => src.Trip.SiteVisits.Count > 1));
            ValidationMapper.CreateMap<SiteVisit, ImportSiteModel>()
                .ForPath("SubsiteVisits*", "Subsites*")
                .ForPath("SubsiteVisits[*].Coordinates*", "Subsites[*].Coordinates")
                .IgnorePath("SubsiteVisits[*].TreeMeasurements");

            CreateMap<SubsiteVisit, ImportSubsiteModel>();

            CreateMap<ImportSitesModel, Trip>()
                .AfterMap((src, dest) =>
                    {
                        src.Sites.ForEach(s => Mapper.Map<ImportSiteModel, Model.Trips.SiteVisit>(s, dest.SiteVisits.First(sv => sv.Id == s.Id)));
                    });

            CreateMap<ImportSiteModel, SiteVisit>()
                .ForMember(dest => dest.Coordinates, opt => opt.MapFrom(src => Coordinates.Create(src.Coordinates)))
                .ForMember(dest => dest.CoordinatesEntered, opt => opt.MapFrom(src => !string.IsNullOrWhiteSpace(src.Coordinates)))
                .AfterMap((src, dest) =>
                {
                    src.Subsites.ForEach(ss => Mapper.Map<ImportSubsiteModel, Model.Trips.SubsiteVisit>(ss, dest.SubsiteVisits.First(ssv => ssv.Id == ss.Id)));
                    if (src.Subsites.Count == 1)
                    {
                        dest.Name = dest.SubsiteVisits[0].Name;
                        dest.Coordinates = dest.SubsiteVisits[0].Coordinates.Clone() as Coordinates;
                        dest.CoordinatesEntered = dest.SubsiteVisits[0].CoordinatesEntered;
                        dest.Comments = dest.SubsiteVisits[0].Comments;
                    }
                });

            CreateMap<ImportSubsiteModel, SubsiteVisit>()
                .ForMember(dest => dest.Country, opt => opt.MapFrom(src => src.State == null ? null : src.State.Country))
                .ForMember(dest => dest.Coordinates, opt => opt.MapFrom(src => Coordinates.Create(src.Coordinates)))
                .ForMember(dest => dest.CoordinatesEntered, opt => opt.MapFrom(src => !string.IsNullOrWhiteSpace(src.Coordinates)));
                
        }
    }
}