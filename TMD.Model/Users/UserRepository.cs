namespace TMD.Model.Users
{
    public abstract class UserRepository
    {
        public abstract User FindById(int id);
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
