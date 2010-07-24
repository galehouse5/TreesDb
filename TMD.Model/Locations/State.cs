using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using TMD.Model.Validation;
using System.Diagnostics;

namespace TMD.Model.Locations
{
    [Serializable]
    [DebuggerDisplay("{Code}")]
    public class State : IEntity
    {
        protected State()
        { }

        public virtual int Id { get; private set; }
        public virtual Country Country { get; private set; }

        private string m_Code;
        public virtual string Code
        {
            get { return m_Code; }
            private set { m_Code = (value ?? string.Empty).Trim().ToUpper(); }
        }

        private string m_Name;
        public virtual string Name
        {
            get { return m_Name; }
            private set { m_Name = (value ?? string.Empty).Trim().ToTitleCase(); }
        }

        public virtual CoordinateBounds CoordinateBounds { get; private set; }

        public override string ToString()
        {
            return Code;
        }
    }
}
