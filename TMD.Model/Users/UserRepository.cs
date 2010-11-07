using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;

namespace TMD.Model.Users
{
    public abstract class IUserRepository
    {
        public abstract User FindByEmail(string email);

        public User FindByEmailVerificationToken(string urlEncodedToken)
        {
            byte[] token = SecureToken.Decode(urlEncodedToken);
            return InternalFindByEmailVerificationToken(token);
        }

        protected abstract User InternalFindByEmailVerificationToken(byte[] token);

        public User FindByForgottenPasswordAssistanceToken(string urlEncodedToken)
        {
            byte[] token = SecureToken.Decode(urlEncodedToken);
            return InternalFindByForgottenPasswordAssistanceToken(token);
        }

        protected abstract User InternalFindByForgottenPasswordAssistanceToken(byte[] token);

        public abstract void Save(User u);
        public abstract void Remove(User u);
    }
}
