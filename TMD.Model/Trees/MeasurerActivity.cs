using System;

namespace TMD.Model.Trees
{
    public class MeasurerActivity : IEntity
    {
        protected MeasurerActivity()
        { }

        public virtual int Id { get; protected internal set; }
        public virtual Name Name { get; protected internal set; }
        public virtual int? TreesMeasuredCount { get; protected internal set; }
        public virtual int? SitesVisitedCount { get; protected internal set; }
        public virtual DateTime? LastMeasurementDate { get; protected internal set; }
    }
}
