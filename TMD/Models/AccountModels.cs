using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel;
using TMD.Model.Users;
using Microsoft.Practices.EnterpriseLibrary.Validation.Validators;
using TMD.Model.Validation;
using TMD.Model;
using System.Text.RegularExpressions;

namespace TMD.Models
{
    public class AccountLoginModel
    {
        [Required(ErrorMessage="You must enter an email.")]
        [RegularExpression(@"^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,4}$", ErrorMessage = "You must enter a valid email.")]
        [DisplayName("Email:")]
        public string Email { get; set; }
    
        [Required(ErrorMessage="You must enter a password.")]
        [DisplayName("Password:")]
        public string Password { get; set; }

        private bool m_UserSearched = false;
        private User m_User;
        public User User
        {
            get
            {
                if (!m_UserSearched)
                {
                    m_User = UserService.FindByEmail(Email);
                    m_UserSearched = true;
                }
                return m_User;
            }
        }

        public bool DoesUserExist
        {
            get { return User != null; }
        }

        public bool Authenticate()
        {
            bool authenticated = User.AttemptLogin(Password);
            if (authenticated)
            {
                UserSession.CurrentUser = User;
            }
            using (UnitOfWork.BeginBusinessTransaction())
            {
                UserService.Save(User);
                UnitOfWork.Persist();
            }
            return authenticated;
        }

        public void Logout()
        {
            UserSession.CurrentUser = null;
        }
    }

    public class AccountRegistrationModel
    {
        [DisplayName("*Email:")]
        public string Email { get; set; }

        [Required(ErrorMessage = "You must confirm your email.")]
        [DisplayName("*Confirm email:")]
        public string ConfirmEmail { get; set; }

        [DisplayName("Firstname:")]
        public string Firstname { get; set; }

        [DisplayName("Lastname:")]
        public string Lastname { get; set; }

        [DisplayName("*Password:")]
        public string Password { get; set; }

        [Required(ErrorMessage = "You must confirm your password.")]
        [DisplayName("*Confirm password:")]
        public string ConfirmPassword { get; set; }

        private User m_User;
        public User User
        {
            get 
            {
                if (m_User == null)
                {
                    m_User = User.Create(Email, Password);
                    m_User.Firstname = Firstname;
                    m_User.Lastname = Lastname;
                }
                return m_User;
            }
        }

        public bool SaveUnlessEmailIsAlreadyTaken()
        {
            try
            {
                using (UnitOfWork.BeginBusinessTransaction())
                {
                    UserService.Save(User);
                    UnitOfWork.Persist();
                }
            }
            catch (EntityAlreadyExistsException ex)
            {
                UnitOfWork.BeginNewUnitOfWorkToRecoverFromException();
                User existingUser = (User)ex.ExistingEntity;
                if (existingUser.IsEmailVerified)
                {
                    return false;
                }
                else
                {
                    using (UnitOfWork.BeginBusinessTransaction())
                    {
                        User.ReplaceExistingNonEmailVerifiedUser(existingUser);
                        UserService.Save(User);
                        UnitOfWork.Persist();
                    }
                }
            }
            return true;
        }

        public bool VerifyEmail(string token)
        {
            Model.Users.User user = UserService.FindByEmailVerificationToken(token);
            if (user != null && !user.IsEmailVerified)
            {
                using (UnitOfWork.BeginBusinessTransaction())
                {
                    user.VerifyEmail(token);
                    UserService.Save(user);
                    UnitOfWork.Persist();
                }
                return true;
            }
            return false;
        }
    }


    public class EditAccountModel
    {
        public EditAccountModel()
        {
            this.Email = User.Email;
            this.Firstname = User.Firstname;
            this.Lastname = User.Lastname;
        }

        [DisplayName("Email:")]
        public string Email { get; set; }

        [DisplayName("Firstname:")]
        [StringLengthWhenNotNullOrWhitespaceValidator(50, MessageTemplate = "First name must not exceed 50 characters.", Ruleset = "Account")]
        public string Firstname { get; set; }

        [DisplayName("Lastname:")]
        [StringLengthWhenNotNullOrWhitespaceValidator(50, MessageTemplate = "Last name must not exceed 50 characters.", Ruleset = "Account")]
        public string Lastname { get; set; }

        [DisplayName("Existing password:")]
        [StringNotNullOrWhitespaceValidator(MessageTemplate = "You must enter your existing password.", Ruleset = "Password")]
        public string ExistingPassword { get; set; }

        [DisplayName("New password:")]
        [StringNotNullOrWhitespaceValidator(MessageTemplate = "You must enter your new password.", Ruleset = "Password")]
        public string NewPassword { get; set; }

        [DisplayName("Confirm password:")]
        [StringNotNullOrWhitespaceValidator(MessageTemplate = "You must confirm your new password.", Ruleset = "Password")]
        public string ConfirmPassword { get; set; }

        public User User
        {
            get { return UserSession.CurrentUser; }
        }

        public void SaveAccountModifications()
        {
            User.Firstname = Firstname;
            User.Lastname = Lastname;
            using (UnitOfWork.BeginBusinessTransaction())
            {
                UserService.Save(User);
                UnitOfWork.Persist();
            }
        }

        public void SavePasswordChange()
        {
            User.ChangePasswordUsingExistingPassword(ExistingPassword, NewPassword);
            using (UnitOfWork.BeginBusinessTransaction())
            {
                UserService.Save(User);
                UnitOfWork.Persist();
            }
        }
    }

    public class PasswordAssistanceModel
    {
        [StringNotNullOrWhitespaceValidator(MessageTemplate = "You must enter an email.", Ruleset = "Email")]
        [RegexValidator(@"^(?: *|[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,4})$", RegexOptions.Compiled, MessageTemplate = "You must enter a valid email.", Ruleset = "Email")]
        [DisplayName("Email:")]
        public string Email { get; set; }

        [StringNotNullOrWhitespaceValidator(MessageTemplate = "You must confirm your email.", Ruleset = "Email")]
        [DisplayName("Confirm email:")]
        public string ConfirmEmail { get; set; }

        private bool m_UserSearched = false;
        private User m_User;
        public User User
        {
            get
            {
                if (!m_UserSearched)
                {
                    if (!string.IsNullOrEmpty(Token))
                    {
                        m_User = UserService.FindByForgottenPasswordAssistanceToken(Token);
                    }
                    else
                    {
                        m_User = UserService.FindByEmail(Email);
                    }
                    m_UserSearched = true;
                }
                return m_User;
            }
        }

        public bool DoesUserExist
        {
            get { return User != null; }
        }

        public void GeneratePasswordAssistanceToken()
        {
            User.GenerateForgottenPasswordAssistanceToken();
            using (UnitOfWork.BeginBusinessTransaction())
            {
                UserService.Save(User);
                UnitOfWork.Persist();
            }
        }

        private string m_Token;
        public string Token 
        {
            get { return m_Token; }
            set 
            { 
                m_Token = value;
                m_UserSearched = false;
            }
        }

        [DisplayName("New password:")]
        [StringNotNullOrWhitespaceValidator(MessageTemplate = "You must enter your new password.", Ruleset = "Password")]
        public string NewPassword { get; set; }

        [DisplayName("Confirm password:")]
        [StringNotNullOrWhitespaceValidator(MessageTemplate = "You must confirm your new password.", Ruleset = "Password")]
        public string ConfirmPassword { get; set; }

        public void SaveNewPassword()
        {
            User.ChangePasswordUsingPasswordAssistanceToken(Token, NewPassword);
            using (UnitOfWork.BeginBusinessTransaction())
            {
                UserService.Save(User);
                UnitOfWork.Persist();
            }
        }
    }
}