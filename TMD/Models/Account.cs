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

namespace TMD.Models
{
    public class AccountWidgetModel
    {
        public bool IsLoggedOn { get; set; }
        public string Email { get; set; }
        public string Firstname { get; set; }
        public UserRole Roles { get; set; }
    }

    public class AccountLogonModel
    {
        [NotEmptyOrWhitesapce(Message = "You must enter an email.")]
        [Pattern(@"^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,4}$", Message = "You must enter a valid email.")]
        [DisplayName("Email")]
        public string Email { get; set; }

        [NotEmptyOrWhitesapce(Message = "You must enter a password.")]
        [DisplayName("Password")]
        public string Password { get; set; }

        [DisplayName("Remember me on this computer")]
        public bool RememberMe { get; set; }

        [DisplayName("Prove you're human")]
        public bool PerformHumanVerification { get; set; }
    }

    //public class AccountRegistrationModel
    //{
    //    [DisplayName("*Email:")]
    //    public string Email { get; set; }

    //    [Required(ErrorMessage = "You must confirm your email.")]
    //    [DisplayName("*Confirm email:")]
    //    public string ConfirmEmail { get; set; }

    //    [DisplayName("Firstname:")]
    //    public string Firstname { get; set; }

    //    [DisplayName("Lastname:")]
    //    public string Lastname { get; set; }

    //    [DisplayName("*Password:")]
    //    public string Password { get; set; }

    //    [Required(ErrorMessage = "You must confirm your password.")]
    //    [DisplayName("*Confirm password:")]
    //    public string ConfirmPassword { get; set; }
    //}


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

    //public class PasswordAssistanceModel
    //{
    //    [NotEmptyOrWhitesapceAttribute(MessageTemplate = "You must enter an email.", Ruleset = "Email")]
    //    [RegexValidator(@"^(?: *|[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,4})$", RegexOptions.Compiled, MessageTemplate = "You must enter a valid email.", Ruleset = "Email")]
    //    [DisplayName("Email:")]
    //    public string Email { get; set; }

    //    [NotEmptyOrWhitesapceAttribute(MessageTemplate = "You must confirm your email.", Ruleset = "Email")]
    //    [DisplayName("Confirm email:")]
    //    public string ConfirmEmail { get; set; }

    //    [DisplayName("New password:")]
    //    [NotEmptyOrWhitesapceAttribute(MessageTemplate = "You must enter your new password.", Ruleset = "Password")]
    //    public string NewPassword { get; set; }

    //    [DisplayName("Confirm password:")]
    //    [NotEmptyOrWhitesapceAttribute(MessageTemplate = "You must confirm your new password.", Ruleset = "Password")]
    //    public string ConfirmPassword { get; set; }
    //}
}