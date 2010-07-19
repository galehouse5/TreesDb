﻿using System;
using System.Text;
using System.Collections.Generic;
using System.Linq;
using Microsoft.VisualStudio.TestTools.UnitTesting;
using TMD.Model.Users;
using System.Threading;
using TMD.Model;

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
            Assert.IsTrue(Password.Validate("<").Count == 3);
            Assert.IsTrue(Password.Validate("a").Count == 2);
            Assert.IsTrue(Password.Validate("aaaaaaaaaa").Count == 1);
            Assert.IsTrue(Password.Validate("aaaaaaaaaaA1!").Count == 0);
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
            Assert.IsTrue(Password.Validate("Aa!1Aa!1Aa!1").IsValid);
            User u = User.Create("tmdtest@treesdb.org", "Aa!1Aa!1Aa!1");
            using (UnitOfWork.BeginBusinessTransaction())
            {
                UserService.Save(u);
                UnitOfWork.Persist();
            }
            User u2 = UserService.FindByEmail("TMDtest@treesdb.org");
            Assert.AreEqual(u, u2);
            User u3 = UserService.FindByEmailVerificationToken(u.EmailVerificationToken.UrlEncodedValue);
            Assert.AreEqual(u, u3);
            u.GenerateForgottenPasswordAssistanceToken();
            using (UnitOfWork.BeginBusinessTransaction())
            {
                UserService.Save(u);
                UnitOfWork.Persist();
            }
            Assert.IsTrue(u.IsForgottenPasswordAssistanceTokenValid);
            User u4 = UserService.FindByForgottenPasswordAssistanceToken(u.ForgottenPasswordAssistanceToken.UrlEncodedValue);
            Assert.AreEqual(u, u4);
            using (UnitOfWork.BeginBusinessTransaction())
            {
                UserService.Remove(u);
                UnitOfWork.Persist();
            }
        }

        [TestMethod]
        public void PerformHumanVerification()
        {
            User u = User.Create("email", "password");

            Assert.IsFalse(u.PerformHumanVerification);
            u.AttemptLogin("wrongpassword");
            Assert.IsFalse(u.PerformHumanVerification);
            u.AttemptLogin("wrongpassword");
            Assert.IsFalse(u.PerformHumanVerification);
            u.AttemptLogin("wrongpassword");
            Assert.IsTrue(u.PerformHumanVerification);

            Thread.Sleep(1000);
            Assert.IsFalse(u.PerformHumanVerification);
            u.AttemptLogin("wrongpassword");
            Assert.IsFalse(u.PerformHumanVerification);
            u.AttemptLogin("wrongpassword");
            Assert.IsFalse(u.PerformHumanVerification);
            u.AttemptLogin("wrongpassword");
            Assert.IsTrue(u.PerformHumanVerification);

            u.AttemptLogin("password");
            Assert.IsFalse(u.PerformHumanVerification);
            u.AttemptLogin("wrongpassword");
            Assert.IsFalse(u.PerformHumanVerification);
            u.AttemptLogin("wrongpassword");
            Assert.IsFalse(u.PerformHumanVerification);
            u.AttemptLogin("wrongpassword");
            Assert.IsTrue(u.PerformHumanVerification);
        }
    }
}