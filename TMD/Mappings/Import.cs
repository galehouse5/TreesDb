using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using AutoMapper;
using TMD.Model.Trips;
using TMD.Models;

namespace TMD.Mappings
{
    public class ImportMappingProfile : Profile
    {
        protected override void Configure()
        {
            CreateMap<Trip, ImportEditTripModel>()
                .AfterMap((t, m) =>
                    {
                        m.FirstMeasurer = t.Measurers.Count > 0 ? t.Measurers[0].ToFormalName() : string.Empty;
                        m.SecondMeasurer = t.Measurers.Count > 1 ? t.Measurers[1].ToFormalName() : string.Empty;
                        m.ThirdMeasurer = t.Measurers.Count > 2 ? t.Measurers[2].ToFormalName() : string.Empty;
                    });
            ValidationMapper.CreateMap<Trip, ImportEditTripModel>()
                .ForPath("Measurers[0].FirstName", "FirstMeasurer")
                .ForPath("Measurers[0].LastName", "FirstMeasurer")
                .UseMessage("Measurers[0].*", "Name must be specified.")
                .ForPath("Measurers[1].FirstName", "SecondMeasurer")
                .ForPath("Measurers[1].LastName", "SecondMeasurer")
                .UseMessage("Measurers[1].*", "Name must be specified.")
                .ForPath("Measurers[2].FirstName", "ThirdMeasurer")
                .ForPath("Measurers[2].LastName", "ThirdMeasurer")
                .UseMessage("Measurers[2].*", "Name must be specified.")
                .ForPath("Measurers", "FirstMeasurer")
                .UseMessage("Measurers", "Name must be specified.");
            CreateMap<ImportEditTripModel, Trip>()
                .AfterMap((m, t) =>
                    {
                        int lastSpecifiedMeasurer = !string.IsNullOrWhiteSpace(m.ThirdMeasurer) ? 3
                            : !string.IsNullOrWhiteSpace(m.SecondMeasurer) ? 2
                            : !string.IsNullOrWhiteSpace(m.FirstMeasurer) ? 1 : 0;
                        while (t.Measurers.Count < lastSpecifiedMeasurer)
                        {
                            t.AddMeasurer();
                        }
                        while (t.Measurers.Count > lastSpecifiedMeasurer)
                        {
                            t.RemoveMeasurer(t.Measurers[t.Measurers.Count - 1]);
                        }
                        switch (lastSpecifiedMeasurer)
                        {
                            case 3 :
                                t.Measurers[2].FromFormalName(m.ThirdMeasurer);
                                goto case 2;
                            case 2 :
                                t.Measurers[1].FromFormalName(m.SecondMeasurer);
                                goto case 1;
                            case 1 :
                                t.Measurers[0].FromFormalName(m.FirstMeasurer);
                                goto default;
                            default :
                                break;
                        }
                    });
        }
    }
}