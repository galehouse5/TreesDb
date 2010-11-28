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

namespace TMD.Controllers
{
    public class AuthorizeUserAttribute : AuthorizeAttribute
    {
        protected override bool AuthorizeCore(HttpContextBase httpContext)
        {
            if (UserSession.IsAnonymous)
            {
                return false;
            }
            if ((UserSession.User.Roles & Roles) != Roles)
            {
                return false;
            }
            return true;
        }

        protected override void HandleUnauthorizedRequest(AuthorizationContext filterContext)
        {
            if (UserSession.IsAnonymous)
            {
                ((ControllerBase)filterContext.Controller).Session.DefaultReturnUrl = ((ControllerBase)filterContext.Controller).Request.RawUrl;
                filterContext.Result = new RedirectResult("/Account/Logon");
            }
            else
            {
                filterContext.Result = new UnauthorizedResult();
            }
        }

        public new UserRole Roles { get; set; }
    }

    [CheckBrowserCompatibilityFilter]
    public class AccountController : ControllerBase
    {
        [ChildActionOnly]
        public ActionResult Widget()
        {
            AccountWidgetModel model = new AccountWidgetModel()
            {
                IsLoggedOn = IsAuthenticated,
                Email = IsAuthenticated ? User.Email : string.Empty,
                Firstname = IsAuthenticated ? User.Firstname : string.Empty,
                Roles = IsAuthenticated ? User.Roles : UserRole.None
            };
            return PartialView(model);
        }

        public ActionResult LogOn()
        {
            return View(new AccountLogonModel { RememberMe = true });
        }

        [HttpPost]
        [RecaptchaControlMvc.CaptchaValidator]
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

        [HttpGet]
        public ActionResult Logout()
        {
            AccountLogonModel model = new AccountLogonModel();
            // TODO: decouple from FormsAuthentication class so this controller is unit testable
            FormsAuthentication.SignOut();
            Session.ClearRegardingUserSpecificData();
            TempData.StatusMessage = "You have logged out.";
            return Redirect(Session.DefaultReturnUrl);
        }

        //public ActionResult Register()
        //{
        //    AccountRegistrationModel model = new AccountRegistrationModel();
        //    return View(model);
        //}

        //[HttpPost]
        //[RecaptchaControlMvc.CaptchaValidator]
        //public ActionResult Register(AccountRegistrationModel model, bool captchaValid)
        //{
        //    User user = User.Create(model.Email, model.Password);
        //    user.Firstname = model.Firstname;
        //    user.Lastname = model.Lastname;
        //    user.ValidateRegardingPersistence().CopyToModelState(ModelState);
        //    if (!string.IsNullOrEmpty(model.ConfirmPassword) && !model.ConfirmPassword.Equals(model.Password))
        //    {
        //        ModelState.AddModelError("ConfirmPassword", "Your passwords do not match.");
        //    }
        //    if (!string.IsNullOrEmpty(model.ConfirmEmail) && !model.ConfirmEmail.Equals(model.Email))
        //    {
        //        ModelState.AddModelError("ConfirmEmail", "Your emails do not match.");
        //    }
        //    if (!ModelState.IsValid)
        //    {
        //        return View(model);
        //    }
        //    if (!captchaValid)
        //    {
        //        return View("VerifyHumanBeforeRegistering", model);
        //    }

        //    try
        //    {
        //        using (UnitOfWork.BeginBusinessTransaction())
        //        {
        //            UserRepository.Save(user);
        //            UnitOfWork.Persist();
        //        }
        //    }
        //    catch (EntityAlreadyExistsException ex)
        //    {
        //        UnitOfWork.BeginNewUnitOfWorkToRecoverFromException();
        //        User existingUser = (User)ex.ExistingEntity;
        //        if (existingUser.IsEmailVerified)
        //        {
        //            ModelState.AddModelError("Email", "You must choose a different email.");
        //            return View(model);
        //        }
        //        else
        //        {
        //            using (UnitOfWork.BeginBusinessTransaction())
        //            {
        //                user.ReplaceExistingNonEmailVerifiedUser(existingUser);
        //                UserRepository.Save(user);
        //                UnitOfWork.Persist();
        //            }
        //        }
        //    }
        //    using (SmtpClient mailClient = new SmtpClient())
        //    using (MailMessage mail = EmailVerificationEmail.Create(user))
        //    {
        //        mailClient.EnableSsl = true;
        //        mailClient.Send(mail);
        //    }
        //    return View("VerifyEmailAfterRegistering", model);
        //}

        //[HttpGet]
        //public ActionResult Verify(string id)
        //{
        //    if (!string.IsNullOrEmpty(id))
        //    {
        //        User user = UserRepository.FindByEmailVerificationToken(id);
        //        if (user != null && !user.IsEmailVerified)
        //        {
        //            using (UnitOfWork.BeginBusinessTransaction())
        //            {
        //                user.VerifyEmail(id);
        //                UserRepository.Save(user);
        //                UnitOfWork.Persist();
        //            }
        //            return View("RegistrationComplete");
        //        }
        //    }
        //    return View("EmailAlreadyVerified");
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

        //public ActionResult RequestPasswordAssistance()
        //{
        //    PasswordAssistanceModel model = new PasswordAssistanceModel();
        //    return View("PasswordAssistance", model);
        //}

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

        //[HttpPost]
        //public ActionResult RenewSessionTimeout()
        //{
        //    return new EmptyResult();
        //}

        //[HttpPost]
        //public ActionResult TimeoutSession()
        //{
        //    AccountLoginModel model = new AccountLoginModel();
        //    // TODO: decouple from FormsAuthentication class so this controller is unit testable
        //    FormsAuthentication.SignOut();
        //    Session.ClearRegardingUserSpecificData();
        //    TempData.StatusMessage = "Your session has timed out due to inactivity.";
        //    return new EmptyResult();
        //}
    }
}
