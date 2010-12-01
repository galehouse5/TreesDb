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
            : this(false)
        { }

        protected UserCreatedEntityBase(bool recordCreationNow)
        {
            if (recordCreationNow)
            {
                this.RecordCreation();
            }
        }

        protected UserCreatedEntityBase RecordCreation()
        {
            Created = DateTime.Now;
            Creator = UserSession.User;
            return this;
        }

        public virtual int Id { get; private set; }
        public virtual DateTime Created { get; private set; }
        public virtual User Creator { get; private set; }

        public virtual TimeSpan Age
        {
            get { return DateTime.Now.Subtract(Created); }
        }
    }
}
