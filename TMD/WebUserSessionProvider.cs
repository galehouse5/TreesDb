using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using TMD.Model;
using TMD.Model.Users;
using System.Web.Security;
using System.Security.Principal;
using TMD.Model.Extensions;
using System.Diagnostics;
using TMD.Extensions;

namespace TMD
{
    public class AnonymousUser : User
    {
        public AnonymousUser()
        {
            Roles = UserRoles.None | UserRoles.Export;
        }

        public override bool AttemptLogon(string password)
        {
            throw new InvalidEntityOperationException(this);
        }

        public override void ChangePasswordUsingExistingPassword(string existingPassword, string newPassword)
        {
            throw new InvalidEntityOperationException(this);
        }

        public override void ChangePasswordUsingPasswordAssistanceToken(string urlEncodedForgottenPasswordAssistanceToken, string newPassword)
        {
            throw new InvalidEntityOperationException(this);
        }

        public override DateTime Created { get { return DateTime.MinValue; } }
        public override string Email { get { return "Anonymous"; } }
        public override SecureToken EmailVerificationToken { get { return null; } }
        public override DateTime? EmailVerified { get { return null; } }
        public override string Firstname { get { return "Anonymous"; } }
        public override SecureToken ForgottenPasswordAssistanceToken { get { return null; } }
        public override DateTime? ForgottenPasswordAssistanceTokenIssued { get { return null; } }
        public override DateTime? ForgottenPasswordAssistanceTokenUsed { get { return null; } }

        public override void GenerateForgottenPasswordAssistanceToken()
        {
            throw new InvalidEntityOperationException(this);
        }

        public override int Id { get { return -1; } }
        public override bool IsEmailVerified { get { return false; } }
        public override bool IsForgottenPasswordAssistanceTokenValid { get { return false; } }

        public override DateTime LastActivity { get { return DateTime.MinValue; } }
        public override DateTime? LastFailedLogonAttempt { get { return null; } }
        public override DateTime LastLogon { get { return DateTime.MinValue; } }
        public override string Lastname { get { return "Anonymous"; } }
        public override Password Password { get { return null; } }
        public override bool PerformHumanVerification { get { return false; } }
        public override int RecentlyFailedLogonAttempts { get { return 0; } }

        public override void RegenerateEmailVerificationToken()
        {
            throw new InvalidEntityOperationException(this);
        }

        public override void ChangePasswordIfNonEmailVerified(string newPassword)
        {
            throw new InvalidEntityOperationException(this);
        }

        public override void ReportActivity()
        {
            throw new InvalidEntityOperationException(this);
        }

        public override void VerifyEmail(string urlEncodedEmailVerificationToken)
        {
            throw new InvalidEntityOperationException(this);
        }

        public override bool VerifyPassword(string password)
        {
            throw new InvalidEntityOperationException(this);
        }
    }

    public class WebUserSessionProvider : IUserSessionProvider, IHttpModule
    {
        private HttpApplication ApplicationContext { get; set; }

        public void Dispose()
        {
            ApplicationContext.AcquireRequestState -= Context_PostAuthenticateRequest;
        }

        public void Init(HttpApplication context)
        {
            ApplicationContext = context;
            ApplicationContext.PostAuthenticateRequest += new EventHandler(Context_PostAuthenticateRequest);
        }

        void Context_PostAuthenticateRequest(object sender, EventArgs e)
        {
            ApplicationContext.Context.User = ApplicationContext.Context.User.Identity.IsAuthenticated ?
                new WebUser(Repositories.Users.FindById(int.Parse(ApplicationContext.Context.User.Identity.Name))) :
                new WebUser(new AnonymousUser());
        }

        bool IUserSessionProvider.IsAnonymous
        {
            get { return !HttpContext.Current.User.Identity.IsAuthenticated; }
        }

        User IUserSessionProvider.User
        {
            get { return HttpContext.Current.User is GenericPrincipal ? null : (WebUser)HttpContext.Current.User; }
        }

        Units IUserSessionProvider.Units
        {
            get { return HttpContext.Current.Request.Cookies.GetUnitsPreference(); }
        }
    }

    [DebuggerDisplay("{Name}")]
    public class WebUser : IPrincipal, IIdentity
    {
        internal WebUser(User user)
        {
            InternalUser = user;
        }

        public User InternalUser { get; private set; }

        public IIdentity Identity
        {
            get { return this; }
        }

        public bool IsInRole(string role)
        {
            UserRoles userRole = role.ParseEnum<UserRoles>(UserRoles.None);
            if (IsAuthenticated)
            {
                return InternalUser.IsInRole(userRole);
            }
            return userRole == UserRoles.None;
        }

        public string AuthenticationType
        {
            get { return "Custom"; }
        }

        public bool IsAuthenticated
        {
            get { return !(InternalUser is AnonymousUser); }
        }

        public string Name
        {
            get { return InternalUser.Email; }
        }

        public static implicit operator User(WebUser wu)
        {
            return wu.InternalUser;
        }
    }
}