using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using TMD.Model.Users;
using NHibernate.Exceptions;
using TMD.Model;

namespace TMD.Infrastructure.Repositories
{
    public class UserRepository : TMD.Model.Users.UserRepository
    {
        public override User FindByEmail(string email)
        {
            return Registry.Session.CreateQuery(@"select u from User u where u.Email = :email")
                .SetParameter("email", email)
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
            try
            {
                Registry.Session.SaveOrUpdate(u);
            }
            catch (GenericADOException ex)
            {
                if (ex.InnerException != null && ex.InnerException.Message.Contains("duplicate"))
                {
                    User existingUser = FindByEmail(u.Email);
                    if (existingUser != null)
                    {
                        throw new EntityAlreadyExistsException(u, existingUser, string.Format(
                            "A user already exists with the email '{0}'.", u.Email));
                    }
                }
                throw;
            }
        }

        public override void Remove(User u)
        {
            Registry.Session.Delete(u);
        }
    }
}
