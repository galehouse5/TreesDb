﻿using System;
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

namespace TMD.Controllers
{
    public class AuthorizeUserAttribute : AuthorizeAttribute
    {
        protected override bool AuthorizeCore(HttpContextBase httpContext)
        {
            if (!httpContext.User.Identity.IsAuthenticated)
            {
                return false;
            }
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
                ((ControllerBase)filterContext.Controller).Session.DefaultReturnUrl = ((ControllerBase)filterContext.Controller).Request.RawUrl;
                filterContext.Result = new RedirectResult("/Account/Logon");
            }
        }

        public new UserRoles Roles { get; set; }
    }

    [CheckBrowserCompatibilityFilter]
    public class AccountController : ControllerBase
    {
        [ChildActionOnly]
        public ActionResult AccountWidget()
        {
            return PartialView(new AccountWidgetModel
            {
                IsLoggedOn = !(User is AnonymousUser),
                Email = User.Email,
            });
        }

        public ActionResult LogOn()
        {
            return View(new AccountLogonModel { });
        }

        [HttpPost, RecaptchaControlMvc.CaptchaValidator]
        public ActionResult Logon(AccountLogonModel model, bool captchaValid)
        {
            if (!ModelState.IsValid)
            {
                return View(model);
            }
            User user = Repositories.Users.FindByEmail(model.Email);
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
            using (UnitOfWork.Begin())
            {
                Repositories.Users.Save(user);
                UnitOfWork.Persist();
            }
            if (!authenticated)
            {
                ModelState.AddModelError("Email", "Invalid email or password.");
                return View(model);
            }
            // TODO: decouple from FormsAuthentication class so this controller is unit testable
            FormsAuthentication.SetAuthCookie(user.Email, model.RememberMe);
            Session.ClearRegardingUserSpecificData();
            return Redirect(Session.DefaultReturnUrl);
        }

        public ActionResult Logout()
        {
            AccountLogonModel model = new AccountLogonModel();
            // TODO: decouple from FormsAuthentication class so this controller is unit testable
            FormsAuthentication.SignOut();
            Session.ClearRegardingUserSpecificData();
            TempData.StatusMessage = "You have logged out.";
            return Redirect(Session.DefaultReturnUrl);
        }

        public ActionResult Register()
        {
            return View(new AccountRegistrationModel { });
        }

        [HttpPost, RecaptchaControlMvc.CaptchaValidator]
        public ActionResult Register(AccountRegistrationModel model, bool captchaValid)
        {
            if (!ModelState.IsValid)
            {
                return View(model);
            }
            var user = Model.Users.User.Create(model.Email, model.Password);
            this.ValidateMappedModel<Model.Users.User, AccountRegistrationModel>(user, Tag.Screening, Tag.Persistence);
            if (!ModelState.IsValid)
            {
                return View(model);
            }
            if (!captchaValid)
            {
                model.PerformHumanVerification = true;
                return View(model);
            }
            try
            {
                using (UnitOfWork.BeginAndPersist()) { Repositories.Users.Save(user); }
            }
            catch (EntityAlreadyExistsException ex)
            {
                var existingUser = (Model.Users.User)ex.ExistingEntity;
                if (existingUser.IsEmailVerified)
                {
                    ModelState.AddModelError("Email", "You must choose a different email.");
                    return View(model);
                }
                else
                {
                    using (UnitOfWork.BeginAndPersist()) 
                    {
                        user.ReplaceExistingNonEmailVerifiedUser(existingUser);
                        Repositories.Users.Save(user);
                    }
                }
            }
            using (SmtpClient mailClient = new SmtpClient())
            using (MailMessage mail = EmailVerificationEmail.Create(user, Url))
            {
                mailClient.EnableSsl = true;
                mailClient.Send(mail);
            }
            model.RegistrationComplete = true;
            return View(model);
        }

        public ActionResult VerifyEmail(string token)
        {
            if (!string.IsNullOrEmpty(token))
            {
                User user = Repositories.Users.FindByEmailVerificationToken(token);
                if (user != null && !user.IsEmailVerified)
                {
                    using (UnitOfWork.BeginAndPersist())
                    {
                        user.VerifyEmail(token);
                        Repositories.Users.Save(user);
                    }
                    return View(true);
                }
            }
            return View(false);
        }


        public ActionResult PasswordAssistance()
        {
            return View(new PasswordAssistanceModel { });
        }

        //[HttpPost]
        //[RecaptchaControlMvc.CaptchaValidator]
        //public ActionResult RequestPasswordAssistance(PasswordAssistanceModel model, bool captchaValid)
        //{
        //    model.Validate("Email").CopyToModelState(ModelState);
        //    if (!string.IsNullOrEmpty(model.ConfirmEmail) && !model.ConfirmEmail.Equals(model.Email))
        //    {
        //        ModelState.AddModelError("ConfirmEmail", "Your emails do not match.");
        //    }
        //    if (!ModelState.IsValid)
        //    {
        //        return View("PasswordAssistance", model);
        //    }
        //    if (!captchaValid)
        //    {
        //        return View("VerifyHumanBeforeEmailingPasswordAssistance", model);
        //    }
        //    User user = UserRepository.FindByEmail(model.Email);
        //    if (user != null)
        //    {
        //        user.GenerateForgottenPasswordAssistanceToken();
        //        using (UnitOfWork.BeginBusinessTransaction())
        //        {
        //            UserRepository.Save(user);
        //            UnitOfWork.Persist();
        //        }
        //        using (SmtpClient mailClient = new SmtpClient())
        //        using (MailMessage mail = PasswordAssistanceEmail.Create(user))
        //        {
        //            mailClient.EnableSsl = true;
        //            mailClient.Send(mail);
        //        }
        //    }
        //    return View("PasswordAssistanceEmailed", model);
        //}

        //public ActionResult ProvidePasswordAssistance(string id)
        //{
        //    if (!string.IsNullOrEmpty(id))
        //    {
        //        User user = UserRepository.FindByForgottenPasswordAssistanceToken(id);
        //        if (user != null && user.IsForgottenPasswordAssistanceTokenValid)
        //        {
        //            PasswordAssistanceModel model = new PasswordAssistanceModel();
        //            return View("CreatePassword", model);
        //        }
        //    }
        //    return View("PasswordAssistanceRequestExpired");
        //}

        //[HttpPost]
        //public ActionResult ProvidePasswordAssistance(PasswordAssistanceModel model, string id)
        //{
        //    User user = UserRepository.FindByForgottenPasswordAssistanceToken(id);
        //    if (user == null || !user.IsForgottenPasswordAssistanceTokenValid)
        //    {
        //        return View("PasswordAssistanceRequestExpired");
        //    }
        //    model.Validate("Password").CopyToModelState(ModelState);
        //    if (!string.IsNullOrEmpty(model.ConfirmPassword) && !model.ConfirmPassword.Equals(model.NewPassword))
        //    {
        //        ModelState.AddModelError("ConfirmPassword", "Your passwords do not match.");
        //    }
        //    if (!string.IsNullOrEmpty(model.NewPassword))
        //    {
        //        user.ValidateNewPassword(model.NewPassword).CopyToModelStateForKey(ModelState, "NewPassword");
        //    }
        //    if (!ModelState.IsValid)
        //    {
        //        return View("CreatePassword", model);
        //    }
        //    user.ChangePasswordUsingPasswordAssistanceToken(id, model.NewPassword);
        //    using (UnitOfWork.BeginBusinessTransaction())
        //    {
        //        UserRepository.Save(user);
        //        UnitOfWork.Persist();
        //    }
        //    return View("PasswordCreated");
        //}





        //[HttpGet]
        //[AuthorizeUser]
        //public ActionResult Edit()
        //{
        //    EditAccountModel model = new EditAccountModel()
        //    {
        //        Email = User.Email,
        //        Firstname = User.Firstname,
        //        Lastname = User.Lastname
        //    };
        //    return View("Edit", model);
        //}

        //[HttpPost]
        //[AuthorizeUser]
        //public ActionResult Edit(EditAccountModel model)
        //{
        //    model.Validate("Account").CopyToModelState(ModelState);
        //    if (ModelState.IsValid)
        //    {
        //        User.Firstname = model.Firstname;
        //        User.Lastname = model.Lastname;
        //        using (UnitOfWork.BeginBusinessTransaction())
        //        {
        //            UserRepository.Save(User);
        //            UnitOfWork.Persist();
        //        }
        //        TempData.StatusMessage = "Your account has been saved.";
        //        return Redirect(Session.DefaultReturnUrl);
        //    }
        //    return View("Edit", model);
        //}

        //[HttpPost]
        //[AuthorizeUser]
        //public ActionResult Password(EditAccountModel model)
        //{
        //    model.Validate("Password").CopyToModelState(ModelState);
        //    if (!string.IsNullOrEmpty(model.ConfirmPassword) && !model.ConfirmPassword.Equals(model.NewPassword))
        //    {
        //        ModelState.AddModelError("ConfirmPassword", "Your passwords do not match.");
        //    }
        //    if (!string.IsNullOrEmpty(model.NewPassword))
        //    {
        //        User.ValidateNewPassword(model.NewPassword).CopyToModelStateForKey(ModelState, "NewPassword");
        //    }
        //    if (!string.IsNullOrEmpty(model.ExistingPassword) && !User.VerifyPassword(model.ExistingPassword))
        //    {
        //        ModelState.AddModelError("ExistingPassword", "Invalid password.");
        //    }
        //    if (ModelState.IsValid)
        //    {
        //        User.ChangePasswordUsingExistingPassword(model.ExistingPassword, model.NewPassword);
        //        using (UnitOfWork.BeginBusinessTransaction())
        //        {
        //            UserRepository.Save(User);
        //            UnitOfWork.Persist();
        //        }
        //        TempData.StatusMessage = "Your password has been changed.";
        //        return Redirect(Session.DefaultReturnUrl);
        //    }
        //    return View("Edit", model);
        //}
    }
}
