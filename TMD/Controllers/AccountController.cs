using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.Web.Mvc;
using TMD.Models;
using Microsoft.Practices.EnterpriseLibrary.Validation;
using TMD.Extensions;
using Recaptcha;
using TMD.Model.Users;
using TMD.Model;
using System.Net.Mail;
using TMD.EmailTemplates;
using TMD.Application;

namespace TMD.Controllers
{
    public class AccountController : Controller
    {
        [HttpGet]
        public ActionResult Unauthorized()
        {
            return View();
        }

        [HttpGet]
        public ActionResult Login()
        {
            AccountLoginModel model = new AccountLoginModel();
            return View(model);
        }

        [HttpPost]
        [RecaptchaControlMvc.CaptchaValidator]
        public ActionResult Login(AccountLoginModel model, bool captchaValid, string ReturnUrl)
        {
            if (!ModelState.IsValid)
            {
                return View(model);
            }
            if (!model.DoesUserExist || !model.User.IsEmailVerified)
            {
                ModelState.AddModelError("Email", "Invalid email or password.");
                return View(model);
            }
            if (model.User.PerformHumanVerification)
            {
                if (!captchaValid)
                {
                    return View("VerifyHumanBeforeLogin"); 
                }
            } 
            if (!model.Authenticate())
            {
                ModelState.AddModelError("Email", "Invalid email or password.");
                return View(model);
            }
            if (!string.IsNullOrWhiteSpace(ReturnUrl))
            {
                return Redirect(ReturnUrl);
            }
            return RedirectToAction(ApplicationSession.DefaultAction, ApplicationSession.DefaultController);
        }

        [HttpPost]
        public ActionResult Logout()
        {
            AccountLoginModel model = new AccountLoginModel();
            model.Logout();
            ApplicationSession.StatusMessage = "You have logged out.";
            return RedirectToAction(ApplicationSession.DefaultAction, ApplicationSession.DefaultController);
        }

        [HttpGet]
        public ActionResult Register()
        {
            AccountRegistrationModel model = new AccountRegistrationModel();
            return View(model);
        }

        [HttpPost]
        [RecaptchaControlMvc.CaptchaValidator]
        public ActionResult Register(AccountRegistrationModel model, bool captchaValid)
        {
            model.User.ValidateRegardingPersistence().CopyToModelState(ModelState);
            if (!string.IsNullOrEmpty(model.ConfirmPassword) && !model.ConfirmPassword.Equals(model.Password))
            {
                ModelState.AddModelError("ConfirmPassword", "Your passwords do not match.");
            }
            if (!string.IsNullOrEmpty(model.ConfirmEmail) && !model.ConfirmEmail.Equals(model.Email))
            {
                ModelState.AddModelError("ConfirmEmail", "Your emails do not match.");
            }
            if (!ModelState.IsValid)
            {
                return View(model);
            }
            if (!captchaValid)
            {
                return View("VerifyHumanBeforeRegistering", model);
            }
            if (!model.SaveUnlessEmailIsAlreadyTaken())
            {
                ModelState.AddModelError("Email", "You must choose a different email.");
                return View(model);
            }
            using (SmtpClient mailClient = new SmtpClient())
            using (MailMessage mail = EmailVerificationEmail.Create(model.User))
            {
                mailClient.EnableSsl = true;
                mailClient.Send(mail);
            }
            return View("VerifyEmailAfterRegistering", model);
        }

        [HttpGet]
        public ActionResult VerifyEmail(string id)
        {
            AccountRegistrationModel model = new AccountRegistrationModel();
            if (model.VerifyEmail(id))
            {
                return View("RegistrationComplete");
            }
            return View("EmailAlreadyVerified");
        }

        [HttpGet]
        [UserAuthorizationFilter]
        public ActionResult EditMyself()
        {
            EditAccountModel model = new EditAccountModel();
            return View("Edit", model);
        }

        [HttpPost]
        [UserAuthorizationFilter]
        public ActionResult EditMyself(EditAccountModel model)
        {
            model.Validate("Account").CopyToModelState(ModelState);
            if (ModelState.IsValid)
            {
                model.SaveAccountModifications();
                ApplicationSession.StatusMessage = "Your account has been saved.";
                return RedirectToAction(ApplicationSession.DefaultAction, ApplicationSession.DefaultController);
            }
            return View("Edit", model);
        }

        [HttpPost]
        [UserAuthorizationFilter]
        public ActionResult ChangeMyPassword(EditAccountModel model)
        {
            model.Validate("Password").CopyToModelState(ModelState);
            if (!string.IsNullOrEmpty(model.ConfirmPassword) && !model.ConfirmPassword.Equals(model.NewPassword))
            {
                ModelState.AddModelError("ConfirmPassword", "Your passwords do not match.");
            }
            if (!string.IsNullOrEmpty(model.NewPassword))
            {
                model.User.ValidateNewPassword(model.NewPassword).CopyToModelStateForKey(ModelState, "NewPassword");
            }
            if (!string.IsNullOrEmpty(model.ExistingPassword) && !model.User.VerifyPassword(model.ExistingPassword))
            {
                ModelState.AddModelError("ExistingPassword", "Invalid password.");
            }
            if (ModelState.IsValid)
            {
                model.SavePasswordChange();
                ApplicationSession.StatusMessage = "Your password has been changed.";
                return RedirectToAction(ApplicationSession.DefaultAction, ApplicationSession.DefaultController);
            }
            return View("Edit", model);
        }

        [HttpGet]
        public ActionResult PasswordAssistance()
        {
            PasswordAssistanceModel model = new PasswordAssistanceModel();
            return View(model);
        }

        [HttpGet]
        public ActionResult CreatePassword(string id)
        {
            PasswordAssistanceModel model = new PasswordAssistanceModel();
            model.Token = id;
            if (!model.DoesUserExist || !model.User.IsForgottenPasswordAssistanceTokenValid)
            {
                return View("PasswordAssistanceRequestExpired");
            }
            return View("CreatePassword", model);
        }

        [HttpPost]
        public ActionResult CreatePassword(PasswordAssistanceModel model, string id)
        {
            model.Token = id;
            if (!model.DoesUserExist || !model.User.IsForgottenPasswordAssistanceTokenValid)
            {
                return View("PasswordAssistanceRequestExpired");
            }
            model.Validate("Password").CopyToModelState(ModelState);
            if (!string.IsNullOrEmpty(model.ConfirmPassword) && !model.ConfirmPassword.Equals(model.NewPassword))
            {
                ModelState.AddModelError("ConfirmPassword", "Your passwords do not match.");
            }
            if (!string.IsNullOrEmpty(model.NewPassword))
            {
                model.User.ValidateNewPassword(model.NewPassword).CopyToModelStateForKey(ModelState, "NewPassword");
            }
            if (!ModelState.IsValid)
            {
                return View("CreatePassword", model);
            }
            model.SaveNewPassword();
            return View("PasswordCreated");
        }

        [HttpPost]
        [RecaptchaControlMvc.CaptchaValidator]
        public ActionResult PasswordAssistance(PasswordAssistanceModel model, bool captchaValid)
        {
            model.Validate("Email").CopyToModelState(ModelState);
            if (!string.IsNullOrEmpty(model.ConfirmEmail) && !model.ConfirmEmail.Equals(model.Email))
            {
                ModelState.AddModelError("ConfirmEmail", "Your emails do not match.");
            }
            if (!ModelState.IsValid)
            {
                return View(model);
            }
            if (!captchaValid)
            {
                return View("VerifyHumanBeforeEmailingPasswordAssistance", model);
            }
            if (model.DoesUserExist)
            {
                model.GeneratePasswordAssistanceToken();
                using (SmtpClient mailClient = new SmtpClient())
                using (MailMessage mail = PasswordAssistanceEmail.Create(model.User))
                {
                    mailClient.EnableSsl = true;
                    mailClient.Send(mail);
                }
            }
            return View("PasswordAssistanceEmailed", model);
        }
    }
}
