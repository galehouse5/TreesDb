using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.ComponentModel;
using TMD.Model.Users;
using TMD.Model.Validation;
using TMD.Model;
using System.Text.RegularExpressions;
using NHibernate.Validator.Constraints;
using NHibernate.Validator.Engine;

namespace TMD.Models
{
    public class AccountWidgetModel
    {
        public bool IsLoggedOn { get; set; }
        public string Email { get; set; }
        public string Firstname { get; set; }
        public UserRoles Roles { get; set; }
    }

    public class AccountLogonModel
    {
        [NotEmptyOrWhitesapce(Message = "You must enter an email."), Email(Message = "You must enter a valid email."), Length(100, Message = "Email must not exceed 100 characters.")]
        public string Email { get; set; }

        [NotEmptyOrWhitesapce(Message = "You must enter a password."), Length(100, Message = "Password must not exceed 100 characters.")]
        public string Password { get; set; }

        [DisplayName("Remember me on this computer")] 
        public bool RememberMe { get; set; }

        [DisplayName("Prove you're human")] 
        public bool PerformHumanVerification { get; set; }
    }

    [ContextMethod("ValidateEmailsAreSame"), ContextMethod("ValidatePasswordsAreSame")]
    public class AccountRegistrationModel
    {
        [NotEmptyOrWhitesapce(Message = "You must enter an email."), Email(Message = "You must enter a valid email."), Length(100, Message = "Email must not exceed 100 characters.")]
        public string Email { get; set; }

        [DisplayName("Confirm")]
        public string ConfirmEmail { get; set; }

        protected void ValidateEmailsAreSame(IConstraintValidatorContext context)
        {
            if (!string.IsNullOrWhiteSpace(Email) && !string.Equals(Email, ConfirmEmail, StringComparison.OrdinalIgnoreCase))
            {
                context.AddInvalid<AccountRegistrationModel, string>("Your emails do not match.", m => m.ConfirmEmail);
            }
        }

        [NotEmptyOrWhitesapce(Message = "You must enter a password.")]
        public string Password { get; set; }

        [DisplayName("Confirm")]
        public string ConfirmPassword { get; set; }

        protected void ValidatePasswordsAreSame(IConstraintValidatorContext context)
        {
            if (!string.IsNullOrWhiteSpace(Password) && !string.Equals(Password, ConfirmPassword, StringComparison.OrdinalIgnoreCase))
            {
                context.AddInvalid<AccountRegistrationModel, string>("Your passwords do not match.", m => m.ConfirmPassword);
            }
        }

        [DisplayName("Prove you're human")] 
        public bool PerformHumanVerification { get; set; }

        public bool RegistrationComplete { get; set; }
    }

    [ContextMethod("ValidateEmailsAreSame")]
    public class AccountPasswordAssistanceModel
    {
        [NotEmptyOrWhitesapce(Message = "You must enter an email."), Email(Message = "You must enter a valid email."), Length(100, Message = "Email must not exceed 100 characters.")]
        public string Email { get; set; }

        [DisplayName("Confirm")]
        public string ConfirmEmail { get; set; }

        protected void ValidateEmailsAreSame(IConstraintValidatorContext context)
        {
            if (!string.IsNullOrWhiteSpace(Email) && !string.Equals(Email, ConfirmEmail, StringComparison.OrdinalIgnoreCase))
            {
                context.AddInvalid<AccountRegistrationModel, string>("Your emails do not match.", m => m.ConfirmEmail);
            }
        }

        [DisplayName("Prove you're human")]
        public bool PerformHumanVerification { get; set; }

        public bool AssistanceComplete { get; set; }
    }

    [ContextMethod("ValidatePasswordsAreSame")]
    public class CompleteAccountPasswordAssistanceModel
    {
        public bool CanCompletePasswordAssistance { get; set; }
        public bool AssistanceComplete { get; set; }

        [NotEmptyOrWhitesapce(Message = "You must enter a password."), Length(100, Message = "Password must not exceed 100 characters.")]
        public string Password { get; set; }

        [DisplayName("Confirm")]
        public string ConfirmPassword { get; set; }

        protected void ValidatePasswordsAreSame(IConstraintValidatorContext context)
        {
            if (!string.IsNullOrWhiteSpace(Password) && !string.Equals(Password, ConfirmPassword, StringComparison.OrdinalIgnoreCase))
            {
                context.AddInvalid<AccountRegistrationModel, string>("Your passwords do not match.", m => m.ConfirmPassword);
            }
        }
    }

    public class AccountEditModel
    {
        public string Email { get; set; }
        public AccountEditDetailsModel Details { get; set; }
        public AccountEditPasswordModel Password { get; set; }
        public bool EditingDetails { get { return Details != null; } }
        public bool EditingPassword { get { return Password != null; } }
    }

    public class AccountEditDetailsModel
    {
        [Length(100, Message = "Name must not exceed 100 characters."), Pattern(".+,.+", Message="Name must be in Lastname, Firstname format.")]
        public string Name { get; set; }
    }

    [ContextMethod("ValidatePasswordsAreSame")]
    public class AccountEditPasswordModel
    {
        [DisplayName("Existing password")]
        [NotEmptyOrWhitesapce(Message = "You must enter a password."), Length(100, Message = "Password must not exceed 100 characters.")]
        public string ExistingPassword { get; set; }

        [DisplayName("New password")]
        [NotEmptyOrWhitesapce(Message = "You must enter a password."), Length(100, Message = "Password must not exceed 100 characters.")]
        public string NewPassword { get; set; }

        [DisplayName("Confirm")]
        public string ConfirmPassword { get; set; }

        protected void ValidatePasswordsAreSame(IConstraintValidatorContext context)
        {
            if (!string.IsNullOrWhiteSpace(NewPassword) && !string.Equals(NewPassword, ConfirmPassword, StringComparison.OrdinalIgnoreCase))
            {
                context.AddInvalid<AccountRegistrationModel, string>("Your new passwords do not match.", m => m.ConfirmPassword);
            }
        }
    }
}