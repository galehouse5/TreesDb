using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using Microsoft.Practices.EnterpriseLibrary.Validation;
using TMD.Model.Validation;
using System.ComponentModel;
using Microsoft.Practices.EnterpriseLibrary.Validation.Validators;
using System.Diagnostics;
using System.Text.RegularExpressions;
using System.Security.Principal;

namespace TMD.Model.Users
{
    [Flags]
    public enum UserRoles
    {
        None = 0x0,
        Import = 0x1,
        Export = 0x2,
        Admin = 0x4
    }

    [Serializable]
    [DebuggerDisplay("{Email}")]
    public class User : IEntity, IPrincipal, IIdentity
    {
        protected User()
        { }

        public virtual int Id { get; private set; }
        public virtual UserRoles Roles { get; private set; }

        private string m_Email;
        [DisplayName("*Email:")]
        [RegexValidator(@"^(?: *|[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,4})$", RegexOptions.Compiled, MessageTemplate = "You must enter a valid email.", Ruleset = "Screening")]
        [StringNotNullOrWhitespaceValidator(MessageTemplate = "You must enter an email.", Ruleset = "Screening")]
        [StringLengthWhenNotNullOrWhitespaceValidator(100, MessageTemplate = "Email must not exceed 100 characters.", Ruleset = "Persistence", Tag = "User")]
        public virtual string Email 
        {
            get { return m_Email; }
            private set { m_Email = (value ?? string.Empty).Trim().ToLower(); }
        }

        private string m_Firstname;
        [DisplayName("First name:")]
        [StringLengthWhenNotNullOrWhitespaceValidator(50, MessageTemplate = "First name must not exceed 50 characters.", Ruleset = "Persistence", Tag = "User")]
        public virtual string Firstname 
        {
            get { return m_Firstname; }
            set { m_Firstname = (value ?? string.Empty).Trim().ToTitleCase(); }
        }

        private string m_Lastname;
        [DisplayName("Last name:")]
        [StringLengthWhenNotNullOrWhitespaceValidator(50, MessageTemplate = "Last name must not exceed 50 characters.", Ruleset = "Persistence", Tag = "User")]
        public virtual string Lastname
        {
            get { return m_Lastname; }
            set { m_Lastname = (value ?? string.Empty).Trim().ToTitleCase(); }
        }

        [ModelObjectValidator(NamespaceQualificationMode.ReplaceKey, "Screening", Ruleset = "Screening")]
        public virtual Password Password { get; private set; }

        public virtual DateTime Created { get; private set; }
        public virtual DateTime LastActivity { get; private set; }
        public virtual DateTime LastLogon { get; private set; }

        #region Email verification

        public virtual SecureToken EmailVerificationToken { get; private set; }
        public virtual DateTime? EmailVerified { get; private set; }

        public virtual bool IsEmailVerified
        {
            get { return EmailVerified != null; }
        }

        public virtual void RegenerateEmailVerificationToken()
        {
            if (IsEmailVerified)
            {
                throw new InvalidOperationException("Unable to regenerate email verification because email has already been verified.");
            }
            EmailVerificationToken = SecureToken.Create();
        }

        public virtual void VerifyEmail(string urlEncodedEmailVerificationToken)
        {
            if (!EmailVerificationToken.UrlEncodedValue.Equals(urlEncodedEmailVerificationToken))
            {
                throw new InvalidOperationException("Unable to verify email because email verification token is invalid.");
            }
            if (IsEmailVerified)
            {
                throw new InvalidOperationException("Unable to regenerate email verification because email has already been verified.");
            }
            EmailVerified = DateTime.Now;
        }

        #endregion

        #region Forgotten password assistance

        public virtual SecureToken ForgottenPasswordAssistanceToken { get; private set; }
        public virtual DateTime? ForgottenPasswordAssistanceTokenIssued { get; private set; }
        public virtual DateTime? ForgottenPasswordAssistanceTokenUsed { get; private set; }

        public virtual bool IsForgottenPasswordAssistanceTokenValid
        {
            get 
            {
                return ForgottenPasswordAssistanceToken != null
                    && ForgottenPasswordAssistanceTokenIssued >= DateTime.Now.Subtract(ModelRegistry.UserSettings.ForgottenPasswordAssistanceTokenLifetime)
                    && ForgottenPasswordAssistanceTokenUsed == null;
            }
        }

        public virtual void GenerateForgottenPasswordAssistanceToken()
        {
            ForgottenPasswordAssistanceToken = SecureToken.Create();
            ForgottenPasswordAssistanceTokenIssued = DateTime.Now;
            ForgottenPasswordAssistanceTokenUsed = null;
        }

        public virtual void ChangePasswordUsingPasswordAssistanceToken(string urlEncodedForgottenPasswordAssistanceToken, string newPassword)
        {
            if (!ForgottenPasswordAssistanceToken.UrlEncodedValue.Equals(urlEncodedForgottenPasswordAssistanceToken)
                || !IsForgottenPasswordAssistanceTokenValid)
            {
                throw new InvalidOperationException("Unable to change password because forgotten password assistance token is invalid.");
            }
            if (!ValidateNewPassword(newPassword).IsValid)
            {
                throw new InvalidOperationException("Unable to change password because new password is invalid.");
            }
            Password = Password.Create(newPassword, Email);
            ForgottenPasswordAssistanceTokenUsed = DateTime.Now;
        }

        #endregion

        #region Human verification

        public virtual DateTime? LastFailedLogonAttempt { get; private set; }
        public virtual int RecentlyFailedLogonAttempts { get; private set; }

        public virtual bool PerformHumanVerification
        {
            get 
            {
                if (LastFailedLogonAttempt >= DateTime.Now.Subtract(ModelRegistry.UserSettings.FailedLoginMemoryDuration))
                {
                    if (RecentlyFailedLogonAttempts >= ModelRegistry.UserSettings.FailedLoginsBeforeHumanVerification)
                    {
                        return true;
                    }
                }
                return false;
            }
        }

        #endregion

        public virtual void ChangePasswordUsingExistingPassword(string existingPassword, string newPassword)
        {
            if (!ValidateNewPassword(newPassword).IsValid)
            {
                throw new InvalidOperationException("Unable to change password because new password is invalid.");
            }
            if (!VerifyPassword(existingPassword))
            {
                throw new InvalidOperationException("Unable to change password because existing password failed verification.");
            }
            Password = Password.Create(newPassword, Email);
        }

        public virtual bool VerifyPassword(string password)
        {
            return Password.VerifyPassword(password, Email);
        }

        public virtual ValidationResults ValidateNewPassword(string password)
        {
            return Password.Validate(password);
        }

        public virtual ValidationResults ValidateRegardingPersistence()
        {
            return this.Validate("Screening", "Persistence");
        }

        public virtual bool AttemptLogon(string password)
        {
            if (VerifyPassword(password))
            {
                LastLogon = DateTime.Now;
                LastActivity = DateTime.Now;
                RecentlyFailedLogonAttempts = 0;
                return true;
            }
            else
            {
                if (LastFailedLogonAttempt < DateTime.Now.Subtract(ModelRegistry.UserSettings.FailedLoginMemoryDuration))
                {
                    RecentlyFailedLogonAttempts = 0;
                }
                LastFailedLogonAttempt = DateTime.Now;
                RecentlyFailedLogonAttempts += 1;
                return false;
            }
        }

        public virtual void ReportActivity()
        {
            LastActivity = DateTime.Now;
        }

        public virtual void ReplaceExistingNonEmailVerifiedUser(User existingUser)
        {
            if (!existingUser.Email.Equals(Email))
            {
                throw InvalidModelOperationException.Create(this, string.Format(
                    "Unable to replace existing non email verified user because their email must be '{0}'.", Email));
            }
            Id = existingUser.Id;
        }

        public static User Create(string email, string password)
        {
            return new User()
            {
                Email = (email ?? string.Empty).Trim().ToLower(),
                Firstname = string.Empty,
                Lastname = string.Empty,
                Password = Password.Create(password ?? string.Empty, (email ?? string.Empty).Trim().ToLower()),
                Created = DateTime.Now,
                LastActivity = DateTime.Now,
                LastLogon = DateTime.Now,
                EmailVerificationToken = SecureToken.Create(),
                ForgottenPasswordAssistanceToken = null,
                ForgottenPasswordAssistanceTokenIssued = null,
                ForgottenPasswordAssistanceTokenUsed = null,
                RecentlyFailedLogonAttempts = 0,
                LastFailedLogonAttempt = null,
                Roles = UserRoles.Import
            };
        }

        IIdentity IPrincipal.Identity
        {
            get { return this; }
        }

        bool IPrincipal.IsInRole(string role)
        {
            UserRoles userRole = (UserRoles)Enum.Parse(typeof(UserRoles), role);
            return (Roles & userRole) == userRole;
        }

        string IIdentity.AuthenticationType
        {
            get { return "Custom"; }
        }

        bool IIdentity.IsAuthenticated
        {
            get { return true; }
        }

        string IIdentity.Name
        {
            get { return Email; }
        }
    }
}
