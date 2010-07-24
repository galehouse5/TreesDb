using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Diagnostics;
using TMD.Model.Validation;
using Microsoft.Practices.EnterpriseLibrary.Validation;

namespace TMD.Model.Trips
{
    [Serializable]
    [DebuggerDisplay("{LastName}, {FirstName}")]
    public class Measurer : BaseUserCreatedEntity
    {
        protected Measurer()
        { }

        public virtual Trip Trip { get; private set; }

        private string m_FirstName;
        [StringNotNullOrWhitespaceValidator(MessageTemplate = "First name must be specified.", Ruleset = "Screening", Tag = "TreeMeasurer")]
        [StringLengthWhenNotNullOrWhitespaceValidator(50, MessageTemplate = "First name must not exceed 50 characters.", Ruleset = "Persistence", Tag = "Measurer")]
        public virtual string FirstName
        {
            get { return m_FirstName; }
            set { m_FirstName = (value ?? string.Empty).Trim().ToTitleCase(); }
        }

        private string m_LastName;
        [StringNotNullOrWhitespaceValidator(MessageTemplate = "Last name must be specified.", Ruleset = "Screening", Tag = "TreeMeasurer")]
        [StringLengthWhenNotNullOrWhitespaceValidator(50, MessageTemplate = "Last name must not exceed 50 characters.", Ruleset = "Persistence", Tag = "Measurer")]
        public virtual string LastName
        {
            get { return m_LastName; }
            set { m_LastName = (value ?? string.Empty).Trim().ToTitleCase(); }
        }

        public virtual bool IsSpecified
        {
            get { return !string.IsNullOrWhiteSpace(FirstName) || !string.IsNullOrWhiteSpace(LastName); }
        }

        internal static Measurer Create(Trip t)
        {
            return new Measurer()
            {
                FirstName = string.Empty,
                LastName = string.Empty,
                Trip = t
            };
        }
    }
}
