using NHibernate;
using NHibernate.Linq;
using System.Collections.Generic;
using TMD.Model.Locations;
using System.Linq;

namespace TMD.Infrastructure.Repositories
{
    public class LocationRepository : ILocationRepository
    {
        protected ISession Session
        {
            get { return Registry.Session; }
        }

        public State GetState(int id)
        {
            return Session.Get<State>(id);
        }

        public VisitedState GetVisitedState(int id)
        {
            return Session.Get<VisitedState>(id);
        }

        public IEnumerable<VisitedState> SearchVisitedStates(string expression, int maxResults)
        {
            return Session.CreateSQLQuery(
@"select state.*
from dbo.SearchVisitedStates(:expression) rank
join Locations.VisitedStates state
    on state.Id = rank.Id
order by rank.Rank desc")
                .AddEntity(typeof(VisitedState))
                .SetParameter("expression", expression)
                .SetMaxResults(maxResults)
                .List<VisitedState>();
        }

        public IEnumerable<State> GetStates()
        {
            return Session.Query<State>().ToArray();
        }
    }
}
