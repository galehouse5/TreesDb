using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using TMD.Model.Validation;
using TMD.Model.Users;

namespace TMD.Model
{
    [Serializable]
    public class EntityBase : PropertyAttributeValidator, IIsValid, IEntity
    {
        protected EntityBase()
        {
            Created = Date.Now;
            if (!UserSession.User.IsAnonymous)
            {
                Creator = UserSession.User;
            }
            Id = Guid.NewGuid();
        }

        protected EntityBase(bool ignoreCreator)
        {
            Created = Date.Now;
            if (!ignoreCreator && !UserSession.User.IsAnonymous)
            {
                Creator = UserSession.User;
            }
            Id = Guid.NewGuid();
        }

        public Guid Id { get; private set; }
        public Date Created { get; private set; }
        public User Creator { get; private set; } 

        public static bool operator ==(EntityBase e1, EntityBase e2)
        {
            if ((object)e1 == null || (object)e2 == null)
            {
                return (object)e1 == null && (object)e2 == null;
            }
            if (e1.Id == Guid.Empty || e2.Id == Guid.Empty)
            {
                return (object)e1 == (object)e2;
            }
            return e1.Id == e2.Id;
        }

        public static bool operator !=(EntityBase e1, EntityBase e2)
        {
            if ((object)e1 == null || (object)e2 == null)
            {
                return !((object)e1 == null && (object)e2 == null);
            }
            if (e1.Id == Guid.Empty || e2.Id == Guid.Empty)
            {
                return (object)e1 != (object)e2;
            }
            return e1.Id != e2.Id;
        }

        public override bool Equals(object obj)
        {
            EntityBase e = obj as EntityBase;
            return e != null && e == this;
        }

        public override int GetHashCode()
        {
            return Id.GetHashCode();
        }
    }
}
