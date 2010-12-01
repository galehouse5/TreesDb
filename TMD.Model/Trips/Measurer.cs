using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Diagnostics;
using TMD.Model.Validation;
using NHibernate.Validator.Constraints;
using TMD.Model.Extensions;

namespace TMD.Model.Trips
{
    [Serializable]
    [DebuggerDisplay("{LastName}, {FirstName}")]
    public class Measurer : UserCreatedEntityBase
    {
        protected Measurer()
        { }

        public virtual Trip Trip { get; private set; }

        private string m_FirstName;
        [NotEmptyOrWhitesapce(Message = "First name must be specified.", Tags = Tag.Screening)]
        [Length(50, Message = "First name must not exceed 50 characters.", Tags = Tag.Persistence)]
        public virtual string FirstName
        {
            get { return m_FirstName; }
            set { m_FirstName = value.OrEmptyAndTrimToTitleCase(); }
        }

        private string m_LastName;
        [NotEmptyOrWhitesapce(Message = "Last name must be specified.", Tags = Tag.Screening)]
        [Length(50, Message = "Last name must not exceed 50 characters.", Tags = Tag.Persistence)]
        public virtual string LastName
        {
            get { return m_LastName; }
            set { m_LastName = value.OrEmptyAndTrimToTitleCase(); }
        }

        public virtual bool IsSpecified
        {
            get { return !string.IsNullOrWhiteSpace(FirstName) || !string.IsNullOrWhiteSpace(LastName); }
        }

        internal static Measurer Create(Trip t)
        {
            return new Measurer
            {
                FirstName = string.Empty,
                LastName = string.Empty,
                Trip = t
            }.RecordCreation() as Measurer;
        }
    }
}
