using System.Diagnostics;

namespace TMD.Model.Locations
{
    [DebuggerDisplay("{Code}")]
    public abstract class StateBase : EntityBase
    {
        protected StateBase()
        { }

        public virtual string Name { get; protected set; }
        public virtual CoordinateBounds CoordinateBounds { get; protected set; }
        public virtual Country Country { get; protected set; }
        public virtual string DoubleLetterCode { get; protected set; }
        public virtual string TripleLetterCode { get; protected set; }

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

    public class VisitedState : StateBase
    {
        public virtual float? RHI5 { get; protected set; }
        public virtual float? RHI10 { get; protected set; }
        public virtual float? RHI20 { get; protected set; }
        public virtual float? RGI5 { get; protected set; }
        public virtual float? RGI10 { get; protected set; }
        public virtual float? RGI20 { get; protected set; }
    }

    // simplifies differentiation from VisitedState in HQL queries
    public class State : StateBase
    {
        protected State()
        { }
    }
}
