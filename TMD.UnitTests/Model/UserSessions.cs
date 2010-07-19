using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using Microsoft.VisualStudio.TestTools.UnitTesting;
using TMD.Model.Users;
using TMD.Model;

namespace TMD.UnitTests.Model
{
    [TestClass]
    public class UserSessions
    {
        [TestMethod]
        public void Login()
        {
            Assert.IsNull(UserSession.AuthenticatedUser);
            Assert.IsFalse(UserSession.IsAuthenticated);
            User u = User.Create("tmdtest@treesdb.org", "1234poiu");
            Assert.IsFalse(UserSession.Authenticate(u, "poiu1234"));
            Assert.IsTrue(UserSession.Authenticate(u, "1234poiu"));
            Assert.AreEqual(UserSession.AuthenticatedUser, u);
            Assert.IsTrue(UserSession.IsAuthenticated);
            UserSession.Abandon();
            Assert.IsNull(UserSession.AuthenticatedUser);
            Assert.IsFalse(UserSession.IsAuthenticated);
        }
    }
}
