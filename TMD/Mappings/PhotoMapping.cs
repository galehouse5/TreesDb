using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using AutoMapper;
using TMD.Model.Trips;
using TMD.Models;
using TMD.Model.Photos;

namespace TMD.Mappings
{
    public class PhotoMapping : Profile
    {
        protected override void Configure()
        {
            CreateMap<Photo, PhotoEditModel>()
                .ForMember(dest => dest.CanView, opt => opt.UseValue(true))
                .ForMember(dest => dest.CanRemove, opt => opt.UseValue(true));
        }
    }
}