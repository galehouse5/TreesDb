﻿using System;
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

        private string m_DoubleLetterCode;
        public virtual string DoubleLetterCode
        {
            get { return m_DoubleLetterCode; }
            private set { m_DoubleLetterCode = (value ?? string.Empty).Trim().ToUpper(); }
        }

        private string m_TripleLetterCode;
        public virtual string TripleLetterCode
        {
            get { return m_TripleLetterCode; }
            private set { m_TripleLetterCode = (value ?? string.Empty).Trim().ToUpper(); }
        }

        public virtual string Code
        {
            get
            {
                if (!string.IsNullOrWhiteSpace(DoubleLetterCode))
                {
                    return DoubleLetterCode;
                }
                return TripleLetterCode;
            }
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
            return Name;
        }
    }
}
