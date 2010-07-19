using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using TMD.Model.Users;
using NHibernate.Exceptions;
using TMD.Model;

namespace TMD.Infrastructure.Repositories
{
    public class UserRepository : IUserRepository
    {
        public User FindByEmail(string email)
        {
            return InfrastructureRegistry.UnitOfWorkSession
                .CreateQuery(@"select u from User u where u.Email = :email")
                .SetParameter("email", email)
                .UniqueResult<User>();
        }

        public User FindByEmailVerificationToken(byte[] token)
        {
            return InfrastructureRegistry.UnitOfWorkSession
                .CreateQuery(@"select u from User u where u.EmailVerificationToken.Value = :token")
                .SetParameter("token", token)
                .UniqueResult<User>();
        }

        public User FindByForgottenPasswordAssistanceToken(byte[] token)
        {
            return InfrastructureRegistry.UnitOfWorkSession
                .CreateQuery(@"select u from User u where u.ForgottenPasswordAssistanceToken.Value = :token")
                .SetParameter("token", token)
                .UniqueResult<User>();
        }

        public void Save(User u)
        {
            if (!u.ValidateRegardingPersistence().IsValid)
            {
                throw new ApplicationException("Unable to save user due to validation failure.");
            }
            try
            {
                InfrastructureRegistry.UnitOfWorkSession.SaveOrUpdate(u);
            }
            catch (GenericADOException ex)
            {
                if (ex.InnerException != null && ex.InnerException.Message.Contains("duplicate"))
                {
                    User existingUser = FindByEmail(u.Email);
                    if (existingUser != null)
                    {
                        throw EntityAlreadyExistsException.Create(u, existingUser, string.Format(
                            "A user already exists with the mail '{0}'.", u.Email));
                    }
                }
                throw;
            }
        }

        public void Remove(User u)
        {
            InfrastructureRegistry.UnitOfWorkSession.Delete(u);
        }
    }
}
