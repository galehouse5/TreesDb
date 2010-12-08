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
            CreateMap<Measurer, ImportEditMeasurerModel>();
            CreateMap<Trip, ImportEditTripModel>();
            CreateMap<ImportEditMeasurerModel, Measurer>();
            CreateMap<ImportEditTripModel, Trip>();
        }
    }
}