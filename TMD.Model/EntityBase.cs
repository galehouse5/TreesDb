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

    public abstract class EntityBase : IEntity
    {
        public virtual int Id { get; private set; }

        public override bool Equals(object obj)
        {
            EntityBase other = obj as EntityBase;
            if (other == null)
            {
                return false;
            }
            if (!GetUnproxiedType().Equals(other.GetUnproxiedType()))
            {
                return false;
            }
            if (Id == 0)
            {
                return this == other;
            }
            return this.Id == other.Id;
        }

        public virtual Type GetUnproxiedType()
        {
            return this.GetType();
        }

        public override int GetHashCode()
        {
            return GetType().GetHashCode()
                ^ Id.GetHashCode();
        }
    }

    public abstract class UserCreatedEntityBase : EntityBase
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

        protected internal virtual UserCreatedEntityBase RecordCreation()
        {
            Created = DateTime.Now;
            Creator = UserSession.User;
            return this;
        }

        public virtual DateTime Created { get; private set; }
        public virtual User Creator { get; private set; }

        public virtual TimeSpan EntityAge
        {
            get { return DateTime.Now.Subtract(Created); }
        }
    }
}
