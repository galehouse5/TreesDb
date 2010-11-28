using System;
using System.Text;
using System.Collections.Generic;
using System.Linq;
using Microsoft.VisualStudio.TestTools.UnitTesting;
using TMD.Model.Users;
using System.Threading;
using TMD.Model;
using TMD.Model.Validation;

namespace TMD.UnitTests.Model
{
    [TestClass]
    public class Users
    {
        [TestMethod]
        public void VerifyPassword()
        {
            Password p = Password.Create("Galehouse5!", "abc123");
            Assert.IsFalse(p.VerifyPassword("dfjkgjkl;dfgh", "abc123"));
            Assert.IsTrue(p.VerifyPassword("Galehouse5!", "abc123"));
        }

        [TestMethod]
        public void ValidatePassword()
        {
            Assert.AreEqual(3, Password.Validate("<").Length);
            Assert.AreEqual(2, Password.Validate("a").Length);
            Assert.AreEqual(1, Password.Validate("aaaaaaaaaa").Length);
            Assert.AreEqual(0, Password.Validate("aaaaaaaaaaA1!").Length);
        }

        [TestMethod]
        public void GenerateRandomPassword()
        {
            string randomPassword = Password.GenerateRandomPassword(10);
            Assert.IsTrue(randomPassword.Length == 10);
            string randomPassword2 = Password.GenerateRandomPassword(10);
            Assert.IsFalse(randomPassword == randomPassword2);
        }

        [TestMethod]
        public void CreatePassword()
        {
            Password p = Password.Create("Galehouse5!", "abc123");
            Assert.IsTrue(p.Length == 11);
            Assert.IsTrue(p.Numerics == 1);
            Assert.IsTrue(p.Uppercase == 1);
            Assert.IsTrue(p.Lowercase == 8);
            Assert.IsTrue(p.Specials == 1);
            Assert.IsFalse(p.HasInvalidCharacters);
            Assert.IsTrue(p.CharacterTypes == 4);
        }

        [TestMethod]
        public void EncodeAndDecodeSecureToken()
        {
            SecureToken fpt = SecureToken.Create();
            string urlEncodedToken = fpt.UrlEncodedValue;
            byte[] decodedToken = SecureToken.Decode(urlEncodedToken);
            for (int i = 0; i < fpt.Value.Length; i++)
            {
                Assert.IsTrue(fpt.Value[i] == decodedToken[i]);
            }
        }

        [TestMethod]
        public void SaveFindAndRemove()
        {
            Assert.IsTrue(Password.Validate("Aa!1Aa!1Aa!1").IsValid());
            User u = User.Create("tmdtest@treesdb.org", "Aa!1Aa!1Aa!1");
            using (UnitOfWork.Begin())
            {
                Repositories.Users.Save(u);
                UnitOfWork.Persist();
            }
            User u2 = Repositories.Users.FindByEmail("TMDtest@treesdb.org");
            Assert.AreEqual(u, u2);
            User u3 = Repositories.Users.FindByEmailVerificationToken(u.EmailVerificationToken.UrlEncodedValue);
            Assert.AreEqual(u, u3);
            u.GenerateForgottenPasswordAssistanceToken();
            using (UnitOfWork.Begin())
            {
                Repositories.Users.Save(u);
                UnitOfWork.Persist();
            }
            Assert.IsTrue(u.IsForgottenPasswordAssistanceTokenValid);
            User u4 = Repositories.Users.FindByForgottenPasswordAssistanceToken(u.ForgottenPasswordAssistanceToken.UrlEncodedValue);
            Assert.AreEqual(u, u4);
            using (UnitOfWork.Begin())
            {
                Repositories.Users.Remove(u);
                UnitOfWork.Persist();
            }
        }

        [TestMethod]
        public void PerformHumanVerification()
        {
            User u = User.Create("email", "password");

            Assert.IsFalse(u.PerformHumanVerification);
            u.AttemptLogon("wrongpassword");
            Assert.IsFalse(u.PerformHumanVerification);
            u.AttemptLogon("wrongpassword");
            Assert.IsFalse(u.PerformHumanVerification);
            u.AttemptLogon("wrongpassword");
            Assert.IsTrue(u.PerformHumanVerification);

            Thread.Sleep(1000);
            Assert.IsFalse(u.PerformHumanVerification);
            u.AttemptLogon("wrongpassword");
            Assert.IsFalse(u.PerformHumanVerification);
            u.AttemptLogon("wrongpassword");
            Assert.IsFalse(u.PerformHumanVerification);
            u.AttemptLogon("wrongpassword");
            Assert.IsTrue(u.PerformHumanVerification);

            u.AttemptLogon("password");
            Assert.IsFalse(u.PerformHumanVerification);
            u.AttemptLogon("wrongpassword");
            Assert.IsFalse(u.PerformHumanVerification);
            u.AttemptLogon("wrongpassword");
            Assert.IsFalse(u.PerformHumanVerification);
            u.AttemptLogon("wrongpassword");
            Assert.IsTrue(u.PerformHumanVerification);
        }
    }
}
