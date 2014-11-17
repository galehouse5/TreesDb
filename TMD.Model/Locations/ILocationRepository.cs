using System.Collections.Generic;

namespace TMD.Model.Locations
{
    public interface ILocationRepository
    {
        State GetState(int id);
        VisitedState GetVisitedState(int id);

        IEnumerable<VisitedState> SearchVisitedStates(string expression, int maxResults);
        IEnumerable<State> GetStates();
    }
}
