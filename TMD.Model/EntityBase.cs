using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;

namespace TMD.Model
{
    public class EntityBase : IEntity
    {
        protected EntityBase()
        {
            Created = DateTime.Now;
        }

        public Guid Id { get; protected set; }
        public DateTime Created { get; protected set; }

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
