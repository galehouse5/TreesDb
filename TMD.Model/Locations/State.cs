using System;

namespace TMD.Model.Locations
{
    public class State : EntityBase, IGeoAreaMetrics
    {
        protected State()
        { }

        public virtual string Name { get; protected set; }
        public virtual CoordinateBounds CoordinateBounds { get; protected set; }
        public virtual Country Country { get; protected set; }
        public virtual string DoubleLetterCode { get; protected set; }
        public virtual string TripleLetterCode { get; protected set; }
        public virtual RuckerIndex? ComputedRHI5 { get; protected set; }
        public virtual RuckerIndex? ComputedRHI10 { get; protected set; }
        public virtual RuckerIndex? ComputedRHI20 { get; protected set; }
        public virtual RuckerIndex? ComputedRGI5 { get; protected set; }
        public virtual RuckerIndex? ComputedRGI10 { get; protected set; }
        public virtual RuckerIndex? ComputedRGI20 { get; protected set; }
        public virtual int? ComputedTreesMeasuredCount { get; protected set; }
        public virtual DateTime? ComputedLastMeasurementDate { get; protected set; }
        public virtual bool? ComputedContainsEntityWithCoordinates { get; protected set; }

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
            => $"{Name} ({Id})";
    }
}
