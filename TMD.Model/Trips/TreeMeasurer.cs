using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Diagnostics;
using TMD.Model.Validation;

namespace TMD.Model.Trips
{
    [Serializable]
    [DebuggerDisplay("{LastName}, {FirstName}")]
    public class TreeMeasurer : IEntity
    {
        protected TreeMeasurer()
        { }

        public virtual int Id { get; private set; }
        public virtual TreeMeasurement TreeMeasurement { get; private set; }

        private string m_FirstName;
        [StringNotNullOrWhitespaceValidator(MessageTemplate = "First name must be specified.", Ruleset = "Screening", Tag = "TreeMeasurer")]
        [StringLengthWhenNotNullOrWhitespaceValidator(50, MessageTemplate = "First name must not exceed 50 characters.", Ruleset = "Persistence", Tag = "TreeMeasurer")]
        public virtual string FirstName
        {
            get { return m_FirstName; }
            set { m_FirstName = (value ?? string.Empty).Trim().ToTitleCase(); }
        }

        private string m_LastName;
        [StringNotNullOrWhitespaceValidator(MessageTemplate = "Last name must be specified.", Ruleset = "Screening", Tag = "TreeMeasurer")]
        [StringLengthWhenNotNullOrWhitespaceValidator(50, MessageTemplate = "Last name must not exceed 50 characters.", Ruleset = "Persistence", Tag = "TreeMeasurer")]
        public virtual string LastName
        {
            get { return m_LastName; }
            set { m_LastName = (value ?? string.Empty).Trim().ToTitleCase(); }
        }

        internal static TreeMeasurer Create(TreeMeasurement tm)
        {
            return new TreeMeasurer()
            {
                FirstName = string.Empty,
                LastName = string.Empty,
                TreeMeasurement = tm
            };
        }
    }
}
