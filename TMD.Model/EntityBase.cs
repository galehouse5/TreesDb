using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using TMD.Model.Users;

namespace TMD.Model
{
    public interface ISpecified
    {
        bool IsSpecified { get; }
    }

    public interface IEntity 
    {
        int Id { get; }
    }

    public abstract class UserCreatedEntityBase : IEntity
    {
        protected UserCreatedEntityBase()
        {
            Created = DateTime.Now;
            Creator = UserSession.User;
        }

        public virtual int Id { get; private set; }
        public virtual DateTime Created { get; private set; }
        public virtual User Creator { get; private set; }
    }
}
