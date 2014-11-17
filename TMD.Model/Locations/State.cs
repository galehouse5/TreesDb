using System.Diagnostics;

namespace TMD.Model.Locations
{
    [DebuggerDisplay("{Code}")]
    public abstract class StateBase : EntityBase
    {
        protected StateBase()
        { }

        public string Name { get; protected set; }
        public CoordinateBounds CoordinateBounds { get; protected set; }
        public Country Country { get; protected set; }
        public string DoubleLetterCode { get; protected set; }
        public string TripleLetterCode { get; protected set; }

        public string Code
        {
            get { return string.IsNullOrEmpty(DoubleLetterCode) ? TripleLetterCode : DoubleLetterCode; }
        }

        public bool IsMatch(string code)
        {
            return code.Equals(DoubleLetterCode) || code.Equals(TripleLetterCode);
        }

        public override string ToString()
        {
            return Name;
        }
    }

    public class VisitedState : StateBase
    {
        public float? RHI5 { get; protected set; }
        public float? RHI10 { get; protected set; }
        public float? RHI20 { get; protected set; }
        public float? RGI5 { get; protected set; }
        public float? RGI10 { get; protected set; }
        public float? RGI20 { get; protected set; }
    }

    // simplifies differentiation from VisitedState in HQL queries
    public class State : StateBase
    {
        protected State()
        { }
    }
}
