using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using TMD.Model.Validation;
using System.Diagnostics;
using TMD.Model.Extensions;

namespace TMD.Model.Locations
{
    [DebuggerDisplay("{Code}")]
    public class State : EntityBase
    {
        protected State()
        { }

        public virtual string Name { get; protected set; }
        public virtual CoordinateBounds CoordinateBounds { get; private set; }
        public virtual Country Country { get; private set; }
        public virtual string DoubleLetterCode { get; private set; }
        public virtual string TripleLetterCode { get; private set; }

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

        public override string ToString()
        {
            return Name;
        }
    }

    public class VisitedState : State
    {
        public virtual float? RHI5 { get; private set; }
        public virtual float? RHI10 { get; private set; }
        public virtual float? RHI20 { get; private set; }
        public virtual float? RGI5 { get; private set; }
        public virtual float? RGI10 { get; private set; }
        public virtual float? RGI20 { get; private set; }
    }
}
