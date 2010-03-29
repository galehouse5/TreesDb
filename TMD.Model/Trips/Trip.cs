using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;

namespace TMD.Model.Trips
{
    public class Trip : IEntity
    {
        public Guid Id { get; set; }
        public DateTime Created { get; set; }
        public DateTime Date { get; set; }
        public string Website { get; set; }
        public bool PhotosAvailable { get; set; }
        public string MeasurerContact { get; set; }
        public IList<SiteVisit> Visits { get; private set; }
    }
}
