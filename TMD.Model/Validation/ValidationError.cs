using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using NHibernate.Validator.Engine;
using System.Diagnostics;

namespace TMD.Model.Validation
{
    public interface IValidationError
    {
        ICollection<object> Tags { get; }
        string PropertyPath { get; }
        object Value { get; }
        string Message { get; }
    }

    [DebuggerDisplay("{PropertyPath}[{Message}]")]
    internal class InvalidValueValidationError : IValidationError
    {
        private InvalidValue m_InvalidValue;
        public InvalidValueValidationError(InvalidValue iv)
        {
            m_InvalidValue = iv;
        }

        public ICollection<object> Tags { get { return m_InvalidValue.MatchTags; } }
        public string PropertyPath { get { return m_InvalidValue.PropertyPath; } }
        public object Value { get { return m_InvalidValue.Value; } }
        public string Message { get { return m_InvalidValue.Message; } }
    }
}
