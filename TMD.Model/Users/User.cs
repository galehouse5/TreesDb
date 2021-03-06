﻿using NHibernate.Validator.Constraints;
using System;
using TMD.Model.Extensions;
using TMD.Model.Validation;

namespace TMD.Model.Users
{
    public partial class User : IEntity
    {
        protected User()
        { }

        public virtual int Id { get; protected set; }

        private string m_Email;
        [Email(Message = "You must enter a valid email.", Tags = ValidationTag.Required)]
        [NotEmptyOrWhitesapceAttribute(Message = "You must enter an email.", Tags = ValidationTag.Required)]
        [Length(100, Message = "Email must not exceed 100 characters.", Tags = ValidationTag.Required)]
        public virtual string Email
        {
            get { return m_Email; }
            protected set { m_Email = value.OrEmptyAndTrimToLower(); }
        }

        private string m_Firstname;
        [Length(50, Message = "First name must not exceed 50 characters.", Tags = ValidationTag.Required)]
        public virtual string Firstname
        {
            get { return m_Firstname; }
            set { m_Firstname = value.OrEmptyAndTrimToTitleCase(); }
        }

        private string m_Lastname;
        [Length(50, Message = "Last name must not exceed 50 characters.", Tags = ValidationTag.Required)]
        public virtual string Lastname
        {
            get { return m_Lastname; }
            set { m_Lastname = value.OrEmptyAndTrimToTitleCase(); }
        }

        [Valid]
        public virtual Password Password { get; protected set; }

        public virtual DateTime Created { get; protected set; }
        public virtual DateTime LastLogon { get; protected set; }

        #region Email verification

        public virtual SecureToken EmailVerificationToken { get; protected set; }
        public virtual DateTime? EmailVerified { get; protected set; }

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

        public virtual SecureToken ForgottenPasswordAssistanceToken { get; protected set; }
        public virtual DateTime? ForgottenPasswordAssistanceTokenIssued { get; protected set; }
        public virtual DateTime? ForgottenPasswordAssistanceTokenUsed { get; protected set; }

        public virtual bool IsForgottenPasswordAssistanceTokenValid
        {
            get
            {
                return ForgottenPasswordAssistanceToken != null
                    && ForgottenPasswordAssistanceTokenIssued >= DateTime.Now.Subtract(Registry.Settings.ForgottenPasswordAssistanceTokenLifetime)
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
                throw new InvalidEntityOperationException(this, "Unable to change password because forgotten password assistance token is invalid.");

            Password = Password.Create(newPassword, Email);
            ForgottenPasswordAssistanceTokenUsed = DateTime.Now;
        }

        #endregion

        public virtual DateTime? LastFailedLogonAttempt { get; protected set; }
        public virtual int RecentlyFailedLogonAttempts { get; protected set; }

        public virtual void ChangePasswordIfNonEmailVerified(string newPassword)
        {
            if (IsEmailVerified) return;

            Password = Password.Create(newPassword, Email);
        }

        public virtual void ChangePasswordUsingExistingPassword(string existingPassword, string newPassword)
        {
            if (!VerifyPassword(existingPassword))
                throw new InvalidEntityOperationException(this, "Unable to change password because existing password failed verification.");

            Password = Password.Create(newPassword, Email);
        }

        public virtual bool VerifyPassword(string password)
        {
            return Password.VerifyPassword(password, Email);
        }

        public virtual bool AttemptLogon(string password)
        {
            if (VerifyPassword(password))
            {
                LastLogon = DateTime.Now;
                RecentlyFailedLogonAttempts = 0;
                return true;
            }
            else
            {
                if (LastFailedLogonAttempt < DateTime.Now.Subtract(Registry.Settings.FailedLoginMemoryDuration))
                {
                    RecentlyFailedLogonAttempts = 0;
                }
                LastFailedLogonAttempt = DateTime.Now;
                RecentlyFailedLogonAttempts += 1;
                return false;
            }
        }

        public override string ToString()
            => $"{Email} ({Id})";

        public static User Create(string email, string password)
        {
            return new User
            {
                Email = (email ?? string.Empty).Trim().ToLower(),
                Firstname = string.Empty,
                Lastname = string.Empty,
                Password = Password.Create(password ?? string.Empty, (email ?? string.Empty).Trim().ToLower()),
                Created = DateTime.Now,
                LastLogon = DateTime.Now,
                EmailVerificationToken = SecureToken.Create(),
                ForgottenPasswordAssistanceToken = null,
                ForgottenPasswordAssistanceTokenIssued = null,
                ForgottenPasswordAssistanceTokenUsed = null,
                RecentlyFailedLogonAttempts = 0,
                LastFailedLogonAttempt = null,
                Roles = UserRoles.Import | UserRoles.Export
            };
        }
    }
}
