using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using TMD.Model.Users;
using NHibernate.Exceptions;
using TMD.Model;
using NHibernate.Criterion;

namespace TMD.Infrastructure.Repositories
{
    public class UserRepository : TMD.Model.Users.UserRepository
    {
        public override User FindByEmail(string email)
        {
            return Registry.Session.CreateCriteria<User>()
                .Add(Restrictions.Eq("Email", email))
                .UniqueResult<User>();
        }

        protected override User InternalFindByEmailVerificationToken(byte[] token)
        {
            return Registry.Session.CreateQuery(@"select u from User u where u.EmailVerificationToken.Value = :token")
                .SetParameter("token", token)
                .UniqueResult<User>();
        }

        protected override User InternalFindByForgottenPasswordAssistanceToken(byte[] token)
        {
            return Registry.Session.CreateQuery(@"select u from User u where u.ForgottenPasswordAssistanceToken.Value = :token")
                .SetParameter("token", token)
                .UniqueResult<User>();
        }

        protected override void InternalSave(User u)
        {
            Registry.Session.Save(u);
        }

        public override void Remove(User u)
        {
            Registry.Session.Delete(u);
        }

        public override User FindById(int id)
        {
            return Registry.Session.Get<User>(id);
        }
    }
}
