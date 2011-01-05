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
using TMD.Model.Users;

namespace TMD.Mappings
{
    public class AccountMapping : Profile
    {
        protected override void Configure()
        {
            ValidationMapper.CreateMap<User, AccountRegistrationModel>()
                .ForPath("Password.*", "Password");
        }
    }
}