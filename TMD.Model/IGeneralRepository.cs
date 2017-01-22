using System;

namespace TMD.Model
{
    public interface IGeneralRepository
    {
        DateTime? GetLastMetricsUpdateTimestamp();
    }
}
