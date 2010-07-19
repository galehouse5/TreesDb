using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;

namespace TMD.Model
{
    public class ModelException : Exception
    {
        protected ModelException(IEntity entity, string message)
            : base(message)
        {
            this.Entity = entity;
        }

        public IEntity Entity { get; private set; }

        public static ModelException Create(IEntity entity, string message)
        {
            return new ModelException(entity, message);
        }
    }

    public class EntityAlreadyExistsException : ModelException
    {
        protected EntityAlreadyExistsException(IEntity entity, IEntity existingEntity, string message)
            : base(entity, message)
        {
            this.ExistingEntity = existingEntity;
        }

        public IEntity ExistingEntity { get; private set; }

        public static ModelException Create(IEntity entity, IEntity existingEntity, string message)
        {
            return new EntityAlreadyExistsException(entity, existingEntity, message);
        }
    }

    public class InvalidModelOperationException : ModelException
    {
        protected InvalidModelOperationException(IEntity entity, string message)
            : base(entity, message)
        { }

        public new static InvalidModelOperationException Create(IEntity entity, string message)
        {
            return new InvalidModelOperationException(entity, message);
        }
    }
}
