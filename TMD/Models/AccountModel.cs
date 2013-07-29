using System.ComponentModel;
using System.ComponentModel.DataAnnotations;
using System.Web.Mvc;
using TMD.Extensions;
using TMD.Model.Users;

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
        [DataType(DataType.EmailAddress)]
        [Required(ErrorMessage = "You must enter an email."), StringLength(100, ErrorMessage = "Email must not exceed 100 characters."), Email]
        [AdditionalMetadata("size", "50")]
        public string Email { get; set; }

        [DataType(DataType.Password)]
        [Required(ErrorMessage = "You must enter a password."), StringLength(100, ErrorMessage = "Password must not exceed 100 characters.")]
        public string Password { get; set; }

        [DisplayName("Remember me on this computer")]
        public bool RememberMe { get; set; }

        [DisplayName("Prove you're human")] 
        public bool PerformHumanVerification { get; set; }
    }

    public class AccountRegistrationModel
    {
        [DataType(DataType.EmailAddress)]
        [Required(ErrorMessage = "You must enter an email."), StringLength(100, ErrorMessage = "Email must not exceed 100 characters."), Email]
        [System.Web.Mvc.Compare("ConfirmEmail", ErrorMessage = "Your emails do not match.")]
        public string Email { get; set; }

        [DataType(DataType.EmailAddress), DisplayName("Confirm")]
        [Required(ErrorMessage = "You must confirm your email.")]
        public string ConfirmEmail { get; set; }

        [DataType(DataType.Password)]
        [Required(ErrorMessage = "You must enter a password."), StringLength(100, ErrorMessage = "Password must not exceed 100 characters.")]
        [System.Web.Mvc.Compare("ConfirmPassword", ErrorMessage = "Your passwords do not match.")]
        public string Password { get; set; }

        [DataType(DataType.Password), DisplayName("Confirm")]
        [Required(ErrorMessage = "You must confirm your password.")]
        public string ConfirmPassword { get; set; }

        [DisplayName("Prove you're human")] 
        public bool PerformHumanVerification { get; set; }

        public bool RegistrationComplete { get; set; }
    }

    public class AccountPasswordAssistanceModel
    {
        [DataType(DataType.EmailAddress)]
        [Required(ErrorMessage = "You must enter an email."), StringLength(100, ErrorMessage = "Email must not exceed 100 characters."), Email]
        [System.Web.Mvc.Compare("ConfirmEmail", ErrorMessage = "Your emails do not match.")]
        public string Email { get; set; }

        [DataType(DataType.EmailAddress), DisplayName("Confirm")]
        [Required(ErrorMessage = "You must confirm your email.")]
        public string ConfirmEmail { get; set; }

        [DisplayName("Prove you're human")]
        public bool PerformHumanVerification { get; set; }

        public bool AssistanceComplete { get; set; }
    }

    public class CompleteAccountPasswordAssistanceModel
    {
        public bool CanCompletePasswordAssistance { get; set; }
        public bool AssistanceComplete { get; set; }

        [DataType(DataType.Password)]
        [Required(ErrorMessage = "You must enter a password."), StringLength(100, ErrorMessage = "Password must not exceed 100 characters.")]
        [System.Web.Mvc.Compare("ConfirmPassword", ErrorMessage = "Your passwords do not match.")]
        public string Password { get; set; }

        [DataType(DataType.Password), DisplayName("Confirm")]
        [Required(ErrorMessage = "You must confirm your password.")]
        public string ConfirmPassword { get; set; }
    }

    public class AccountEditModel
    {
        [DataType(DataType.EmailAddress), ReadOnly(true)]
        public string Email { get; set; }
        public AccountEditDetailsModel Details { get; set; }
        public AccountEditPasswordModel Password { get; set; }
        public bool EditingDetails { get { return Details != null; } }
        public bool EditingPassword { get { return Password != null; } }
    }

    public class AccountEditDetailsModel
    {
        [Display(Description = "Lastname, Firstname")]
        [StringLength(100, ErrorMessage = "Name must not exceed 100 characters."), RegularExpression(".+,.+", ErrorMessage = "Name must be in Lastname, Firstname format.")]
        public string Name { get; set; }
    }

    public class AccountEditPasswordModel
    {
        [DataType(DataType.Password), DisplayName("Existing password")]
        [Required(ErrorMessage = "You must enter a password."), StringLength(100, ErrorMessage = "Password must not exceed 100 characters.")]
        public string ExistingPassword { get; set; }

        [DataType(DataType.Password), DisplayName("New password")]
        [Required(ErrorMessage = "You must enter a password."), StringLength(100, ErrorMessage = "Password must not exceed 100 characters.")]
        [System.Web.Mvc.Compare("ConfirmPassword", ErrorMessage = "Your passwords do not match.")]
        public string NewPassword { get; set; }

        [DataType(DataType.Password), DisplayName("Confirm")]
        [Required(ErrorMessage = "You must confirm your new password.")]
        public string ConfirmPassword { get; set; }
    }
}