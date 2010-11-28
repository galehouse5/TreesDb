﻿using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using TMD.Model.Validation;
using TMD.Model.Users;
using NHibernate.Validator.Engine;

namespace TMD.Model
{
    public class ModelException : ApplicationException
    {
        public ModelException(string message) 
            : base(message) 
        {
            this.SessionUser = UserSession.User;
            this.SessionIsAnonymous = UserSession.IsAnonymous;
        }

        public bool SessionIsAnonymous { get; private set; }
        public User SessionUser { get; private set; }
    }

    public class EntityAlreadyExistsException : ModelException
    {
        public EntityAlreadyExistsException(IEntity entity, IEntity existingEntity, string message)
            : base(message)
        {
            this.Entity = entity;
            this.ExistingEntity = existingEntity;
        }

        public EntityAlreadyExistsException(IEntity entity, IEntity existingEntity)
            : this(entity, existingEntity, "Entity already exists.")
        { }

        public IEntity Entity { get; private set; }
        public IEntity ExistingEntity { get; private set; }
    }

    public class InvalidEntityOperationException : ModelException
    {
        public InvalidEntityOperationException(IEntity entity)
            : this(entity, "Invalid entity operation.")
        { }

        public InvalidEntityOperationException(IEntity entity, string message)
            : base(message)
        {
            this.Entity = entity;
        }

        public IEntity Entity { get; private set; }
    }

    public class ValidationFailureException : ModelException
    {
        public ValidationFailureException(object source, InvalidValue[] invalidValues)
            : base("Object failed validation.")
        {
            this.Source = source;
            this.InvalidValues = invalidValues;
        }

        public object Source { get; private set; }
        public InvalidValue[] InvalidValues { get; private set; }
    }
}
