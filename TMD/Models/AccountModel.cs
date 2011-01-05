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
        [NotEmptyOrWhitesapce(Message = "You must enter an email."), Email(Message = "You must enter a valid email.")]
        public string Email { get; set; }

        [NotEmptyOrWhitesapce(Message = "You must enter a password.")] 
        public string Password { get; set; }

        [DisplayName("Remember me on this computer")] 
        public bool RememberMe { get; set; }

        [DisplayName("Prove you're human")] 
        public bool PerformHumanVerification { get; set; }
    }

    [ContextMethod("ValidateEmailsAreSame"), ContextMethod("ValidatePasswordsAreSame")]
    public class AccountRegistrationModel
    {
        [NotEmptyOrWhitesapce(Message = "You must enter an email."), Email(Message = "You must enter a valid email.")]
        public string Email { get; set; }

        [DisplayName("Confirm"), NotEmptyOrWhitesapce(Message = "You must confirm your email.")]
        public string ConfirmEmail { get; set; }

        protected void ValidateEmailsAreSame(IConstraintValidatorContext context)
        {
            if (!string.Equals(Email, ConfirmEmail, StringComparison.OrdinalIgnoreCase))
            {
                context.AddInvalid<AccountRegistrationModel, string>("Your emails do not match.", m => m.ConfirmEmail);
            }
        }

        [NotEmptyOrWhitesapce(Message = "You must enter a password.")]
        public string Password { get; set; }

        [DisplayName("Confirm"), NotEmptyOrWhitesapce(Message = "You must confirm your password.")]
        public string ConfirmPassword { get; set; }

        protected void ValidatePasswordsAreSame(IConstraintValidatorContext context)
        {
            if (!string.Equals(Password, ConfirmPassword, StringComparison.OrdinalIgnoreCase))
            {
                context.AddInvalid<AccountRegistrationModel, string>("Your passwords do not match.", m => m.ConfirmPassword);
            }
        }

        [DisplayName("Prove you're human")] 
        public bool PerformHumanVerification { get; set; }

        public bool RegistrationComplete { get; set; }
    }

    public class PasswordAssistanceModel
    {
        [NotEmptyOrWhitesapce(Message = "You must enter an email."), Email(Message = "You must enter a valid email.")]
        public string Email { get; set; }

        [DisplayName("Confirm"), NotEmptyOrWhitesapce(Message = "You must confirm your email.")]
        public string ConfirmEmail { get; set; }

        //[DisplayName("New password:")]
        //[NotEmptyOrWhitesapceAttribute(MessageTemplate = "You must enter your new password.", Ruleset = "Password")]
        //public string NewPassword { get; set; }

        //[DisplayName("Confirm password:")]
        //[NotEmptyOrWhitesapceAttribute(MessageTemplate = "You must confirm your new password.", Ruleset = "Password")]
        //public string ConfirmPassword { get; set; }
    }


    //public class EditAccountModel
    //{
    //    [DisplayName("Email:")]
    //    public string Email { get; set; }

    //    [DisplayName("Firstname:")]
    //    [StringLengthWhenNotNullOrWhitespaceValidator(50, MessageTemplate = "First name must not exceed 50 characters.", Ruleset = "Account")]
    //    public string Firstname { get; set; }

    //    [DisplayName("Lastname:")]
    //    [StringLengthWhenNotNullOrWhitespaceValidator(50, MessageTemplate = "Last name must not exceed 50 characters.", Ruleset = "Account")]
    //    public string Lastname { get; set; }

    //    [DisplayName("Existing password:")]
    //    [NotEmptyOrWhitesapceAttribute(MessageTemplate = "You must enter your existing password.", Ruleset = "Password")]
    //    public string ExistingPassword { get; set; }

    //    [DisplayName("New password:")]
    //    [NotEmptyOrWhitesapceAttribute(MessageTemplate = "You must enter your new password.", Ruleset = "Password")]
    //    public string NewPassword { get; set; }

    //    [DisplayName("Confirm password:")]
    //    [NotEmptyOrWhitesapceAttribute(MessageTemplate = "You must confirm your new password.", Ruleset = "Password")]
    //    public string ConfirmPassword { get; set; }
    //}

    
}