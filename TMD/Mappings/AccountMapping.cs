using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using AutoMapper;
using TMD.Models.Import;
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
            ValidationMapper.CreateMap<User, CompleteAccountPasswordAssistanceModel>()
                .ForPath("Password.*", "Password");
            ValidationMapper.CreateMap<User, AccountEditModel>()
                .ForPath("Password.*", "Password.NewPassword")
                .ForPath("LastName", "Details.Name")
                .ForPath("FirstName", "Details.Name");
            CreateMap<User, AccountEditModel>()
                .ForMember(dest => dest.Details, opt => opt.MapFrom(src => Mapper.Map<User, AccountEditDetailsModel>(src)))
                .ForMember(dest => dest.Password, opt => opt.UseValue(new AccountEditPasswordModel { }));
            CreateMap<User, AccountEditDetailsModel>()
                .ForMember(dest => dest.Name, opt => opt.MapFrom(src => 
                    {
                        return !string.IsNullOrWhiteSpace(src.Firstname) && !string.IsNullOrWhiteSpace(src.Lastname) ?
                            string.Format("{1}, {0}", src.Firstname, src.Lastname) :
                            string.Empty;
                    }));
            CreateMap<AccountEditDetailsModel, User>()
                .ForMember(dest => dest.Firstname, opt => opt.MapFrom(src =>
                    {
                        if (!string.IsNullOrWhiteSpace(src.Name))
                        {
                            string[] parts = src.Name.Split(',');
                            if (parts.Length > 1)
                            {
                                return parts[1];
                            }
                        }
                        return string.Empty;
                    }))
                .ForMember(dest => dest.Lastname, opt => opt.MapFrom(src =>
                    {
                        if (!string.IsNullOrWhiteSpace(src.Name))
                        {
                            string[] parts = src.Name.Split(',');
                            if (parts.Length > 1)
                            {
                                return parts[0];
                            }
                        }
                        return string.Empty;
                    }));
        }
    }
}