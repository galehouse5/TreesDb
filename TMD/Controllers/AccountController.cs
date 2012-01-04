using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.Web.Mvc;
using TMD.Models;
using TMD.Extensions;
using Recaptcha;
using TMD.Model.Users;
using TMD.Model;
using System.Net.Mail;
using TMD.EmailTemplates;
using System.Web.Security;
using TMD.Model.Validation;
using AutoMapper;

namespace TMD.Controllers
{
    public class AuthorizeUserAttribute : AuthorizeAttribute
    {
        protected override bool AuthorizeCore(HttpContextBase httpContext)
        {
            if (!((User)((WebUser)httpContext.User)).IsInRole(Roles))
            {
                return false;
            }
            return true;
        }

        protected override void HandleUnauthorizedRequest(AuthorizationContext filterContext)
        {
            if (filterContext.HttpContext.User.Identity.IsAuthenticated)
            {
                filterContext.Result = new UnauthorizedResult();   
            }
            else
            {
                ((ControllerBase)filterContext.Controller).Session.SetDefaultReturnUrl(((ControllerBase)filterContext.Controller).Request.RawUrl);
                filterContext.Result = new RedirectResult("/Account/Logon");
            }
        }

        public new UserRoles Roles { get; set; }
    }

    [CheckBrowserCompatibilityFilter]
    public partial class AccountController : ControllerBase
    {
        [ChildActionOnly]
        public virtual ActionResult AccountWidget()
        {
            return PartialView(new AccountWidgetModel
            {
                IsLoggedOn = !(User is AnonymousUser),
                Email = User.Email,
            });
        }

        public virtual ActionResult LogOn()
        {
            return View(new AccountLogonModel { });
        }

        [HttpPost, RecaptchaControlMvc.CaptchaValidator]
        public virtual ActionResult Logon(AccountLogonModel model, bool captchaValid)
        {
            if (!ModelState.IsValid)
            {
                return View(model);
            }
            using (var uow = UnitOfWork.Begin())
            {
                var user = Repositories.Users.FindByEmail(model.Email);
                if (user == null || !user.IsEmailVerified)
                {
                    ModelState.AddModelError("Email", "Invalid email or password.");
                    return View(model);
                }
                if (user.PerformHumanVerification && !captchaValid)
                {
                    model.PerformHumanVerification = true;
                    return View(model);
                }
                bool authenticated = user.AttemptLogon(model.Password);
                Repositories.Users.Save(user);
                uow.Persist();
                if (!authenticated)
                {
                    ModelState.AddModelError("Email", "Invalid email or password.");
                    return View(model);
                }
                // TODO: decouple from FormsAuthentication class so this controller is unit testable
                FormsAuthentication.SetAuthCookie(user.Id.ToString(), model.RememberMe);
                Session.ClearRegardingUserSpecificData();
                Response.Cookies.ClearRegardingUserSpecificData();
                TempData.SetAccountMessage(string.Empty);
                return Redirect(Session.GetDefaultReturnUrl());
            }
        }

        public virtual ActionResult Logout()
        {
            AccountLogonModel model = new AccountLogonModel();
            // TODO: decouple from FormsAuthentication class so this controller is unit testable
            FormsAuthentication.SignOut();
            Session.ClearRegardingUserSpecificData();
            Response.Cookies.ClearRegardingUserSpecificData();
            TempData.SetAccountMessage("You have logged out.");
            return Redirect(Session.GetDefaultReturnUrl());
        }

        public virtual ActionResult Register()
        {
            return View(new AccountRegistrationModel { });
        }

        [HttpPost, RecaptchaControlMvc.CaptchaValidator, UnitOfWork]
        public virtual ActionResult Register(IUnitOfWork uow, AccountRegistrationModel model, bool captchaValid)
        {
            if (!ModelState.IsValid)
            {
                return View(model);
            }
            var user = Model.Users.User.Create(model.Email, model.Password);
            this.ValidateMappedModel<Model.Users.User, AccountRegistrationModel>(user, ValidationTag.Screening, ValidationTag.Persistence);
            if (!ModelState.IsValid)
            {
                return View(model);
            }
            if (!captchaValid)
            {
                model.PerformHumanVerification = true;
                return View(model);
            }
            var existingUser = Repositories.Users.FindByEmail(model.Email);
            if (existingUser != null)
            {
                if (existingUser.IsEmailVerified)
                {
                    ModelState.AddModelError("Email", "You must choose a different email.");
                    return View(model);
                }
                user = existingUser;
                user.ChangePasswordIfNonEmailVerified(model.Password);
            }
            Repositories.Users.Save(user);
            uow.Persist();
            using (SmtpClient mailClient = new SmtpClient { EnableSsl = true })
            using (MailMessage mail = EmailVerificationEmail.Create(user,
                Url.Action("CompleteRegistration", new { token = user.EmailVerificationToken.UrlEncodedValue })))
            {
                mailClient.Send(mail);
            }
            model.RegistrationComplete = true;
            return View(model);
        }

        [UnitOfWork]
        public virtual ActionResult CompleteRegistration(IUnitOfWork uow, string token)
        {
            if (!string.IsNullOrEmpty(token))
            {
                var user = Repositories.Users.FindByEmailVerificationToken(token);
                if (user != null && !user.IsEmailVerified)
                {
                    user.VerifyEmail(token);
                    Repositories.Users.Save(user);
                    uow.Persist();
                    return View(true);
                }
            }
            return View(false);
        }

        public virtual ActionResult PasswordAssistance()
        {
            return View(new AccountPasswordAssistanceModel { });
        }

        [HttpPost, RecaptchaControlMvc.CaptchaValidator, UnitOfWork]
        public virtual ActionResult PasswordAssistance(IUnitOfWork uow, AccountPasswordAssistanceModel model, bool captchaValid)
        {
            if (!ModelState.IsValid)
            {
                return View(model);
            }
            if (!captchaValid)
            {
                model.PerformHumanVerification = true;
                return View(model);
            }
            var user = Repositories.Users.FindByEmail(model.Email);
            if (user != null)
            {
                user.GenerateForgottenPasswordAssistanceToken();
                Repositories.Users.Save(user);
                uow.Persist();
                using (SmtpClient mailClient = new SmtpClient { EnableSsl = true })
                using (MailMessage mail = PasswordAssistanceEmail.Create(user,
                    Url.Action("CompletePasswordAssistance", new { token = user.ForgottenPasswordAssistanceToken.UrlEncodedValue })))
                {
                    mailClient.Send(mail);
                }
            }
            model.AssistanceComplete = true;
            return View(model);
        }

        public virtual ActionResult CompletePasswordAssistance(string token)
        {
            if (!string.IsNullOrEmpty(token))
            {
                var user = Repositories.Users.FindByForgottenPasswordAssistanceToken(token);
                if (user != null && user.IsForgottenPasswordAssistanceTokenValid)
                {
                    return View(new CompleteAccountPasswordAssistanceModel { CanCompletePasswordAssistance = true });
                }
            }
            return View(new CompleteAccountPasswordAssistanceModel { CanCompletePasswordAssistance = false });
        }

        [HttpPost, UnitOfWork]
        public virtual ActionResult CompletePasswordAssistance(IUnitOfWork uow, CompleteAccountPasswordAssistanceModel model, string token)
        {
            if (!string.IsNullOrEmpty(token))
            {
                var user = Repositories.Users.FindByForgottenPasswordAssistanceToken(token);
                if (user != null && user.IsForgottenPasswordAssistanceTokenValid)
                {
                    model.CanCompletePasswordAssistance = true;
                    if (!ModelState.IsValid)
                    {
                        return View(model);
                    }
                    user.ChangePasswordUsingPasswordAssistanceToken(token, model.Password);
                    this.ValidateMappedModel<Model.Users.User, AccountRegistrationModel>(user, ValidationTag.Screening, ValidationTag.Persistence);
                    if (!ModelState.IsValid)
                    {
                        return View(model);
                    }
                    uow.Persist();
                    model.AssistanceComplete = true;
                }
            }
            return View(model);
        }

        [AuthorizeUser]
        public virtual ActionResult Edit()
        {
            return View(Mapper.Map<User, AccountEditModel>(User));
        }

        [HttpPost, AuthorizeUser, UnitOfWork]
        public virtual ActionResult Edit(IUnitOfWork uow, AccountEditModel model)
        {
            if (model.EditingPassword)
            {
                if (!ModelState.IsValid)
                {
                    return View(Mapper.Map<User, AccountEditModel>(User));
                }
                if (!User.VerifyPassword(model.Password.ExistingPassword))
                {
                    ModelState.AddModelError("Password.ExistingPassword", "Invalid password."); 
                    return View(Mapper.Map<User, AccountEditModel>(User));
                }
                User.ChangePasswordUsingExistingPassword(model.Password.ExistingPassword, model.Password.NewPassword);
                this.ValidateMappedModel<User, AccountEditModel>(User, ValidationTag.Screening, ValidationTag.Persistence);
                if (!ModelState.IsValid)
                {
                    return View(Mapper.Map<User, AccountEditModel>(User));
                }
                uow.Persist();
                TempData.SetAccountMessage("Your password has been changed.");
                return Redirect(Session.GetDefaultReturnUrl());
            }
            if (model.EditingDetails)
            {
                if (!ModelState.IsValid)
                {
                    return View(model);
                }
                Mapper.Map<AccountEditDetailsModel, User>(model.Details, User);
                this.ValidateMappedModel<User, AccountEditModel>(User, ValidationTag.Screening, ValidationTag.Persistence);
                if (!ModelState.IsValid)
                {
                    return View(model);
                }
                uow.Persist();
                TempData.SetAccountMessage("Your account has been saved.");
                return Redirect(Session.GetDefaultReturnUrl());
            }
            throw new NotImplementedException();
        }
    }
}
