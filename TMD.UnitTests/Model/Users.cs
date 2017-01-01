using Microsoft.VisualStudio.TestTools.UnitTesting;
using System.Threading;
using TMD.Model;
using TMD.Model.Users;

namespace TMD.UnitTests.Model
{
    [TestClass]
    public class Users
    {
        [TestMethod]
        public void VerifysPassword()
        {
            Password p = Password.Create("Galehouse5!", "abc123");
            Assert.IsFalse(p.VerifyPassword("dfjkgjkl;dfgh", "abc123"));
            Assert.IsTrue(p.VerifyPassword("Galehouse5!", "abc123"));
        }

        [TestMethod]
        public void CreatesPassword()
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
        public void EncodesAndDecodeSecureToken()
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
        public void SavesFindsAndRemoves()
        {
            var u = User.Create("tmdtest@treesdb.org", "Aa!1Aa!1Aa!1");
            using (var uow = UnitOfWork.Begin())
            {
                Repositories.Users.Save(u);
                uow.Persist();
            }
            using (var uow = UnitOfWork.Begin())
            {
                var u2 = Repositories.Users.FindByEmail("TMDtest@treesdb.org");
                Assert.AreEqual(u, u2);
                var u3 = Repositories.Users.FindByEmailVerificationToken(u.EmailVerificationToken.UrlEncodedValue);
                Assert.AreEqual(u, u3);
                u.GenerateForgottenPasswordAssistanceToken();
                Repositories.Users.Save(u);
                uow.Persist();
            }
            using (var uow = UnitOfWork.Begin())
            {
                Assert.IsTrue(u.IsForgottenPasswordAssistanceTokenValid);
                var u4 = Repositories.Users.FindByForgottenPasswordAssistanceToken(u.ForgottenPasswordAssistanceToken.UrlEncodedValue);
                Assert.AreEqual(u, u4);
                Repositories.Users.Remove(u);
                uow.Persist();
            }
        }

        [TestMethod]
        public void PerformsHumanVerification()
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
