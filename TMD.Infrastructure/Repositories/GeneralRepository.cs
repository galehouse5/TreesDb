using System;
using TMD.Model;

namespace TMD.Infrastructure.Repositories
{
    public class GeneralRepository : IGeneralRepository
    {
        public DateTime? GetLastMetricsUpdateTimestamp()
            => Registry.Session
            .CreateSQLQuery(@"
select max(LastMetricsUpdateTimestamp)
from
(
    select LastMetricsUpdateTimestamp from Locations.States
    union all select LastMetricsUpdateTimestamp from Sites.Sites
) t")
            .UniqueResult<DateTime?>();
    }
}
