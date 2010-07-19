using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using Microsoft.Practices.Unity;

namespace TMD.Model.Users
{
    public interface IUserRepository
    {
        User FindByEmail(string email);
        User FindByEmailVerificationToken(byte[] token);
        User FindByForgottenPasswordAssistanceToken(byte[] token);
        void Save(User u);
        void Remove(User u);
    }

    public static class UserService
    {
        private static IUserRepository m_Repository = ModelRegistry.RepositoryFactory.Resolve<IUserRepository>();

        public static void Save(User u)
        {
            m_Repository.Save(u);
        }

        public static void Remove(User u)
        {
            m_Repository.Remove(u);
        }

        public static User FindByEmailVerificationToken(string urlEncodedToken)
        {
            byte[] token = SecureToken.Decode(urlEncodedToken);
            return m_Repository.FindByEmailVerificationToken(token);
        }

        public static User FindByForgottenPasswordAssistanceToken(string urlEncodedToken)
        {
            byte[] token = SecureToken.Decode(urlEncodedToken);
            return m_Repository.FindByForgottenPasswordAssistanceToken(token);
        }

        public static User FindByEmail(string email)
        {
            return m_Repository.FindByEmail(email);
        }
    }
}
