using System.Collections.Generic;
using TMD.Model.Locations;

namespace TMD.Infrastructure.Repositories
{
    public class LocationRepository : ILocationRepository
    {
        public Country FindCountryByCode(string code)
        {
            return Registry.Session.CreateQuery(@"
                from Country c 
                where c.DoubleLetterCode = :code or c.TripleLetterCode = :code or c.Name = :code")
                .SetParameter("code", code)
                .UniqueResult<Country>();
        }

        public IList<Country> FindAllCountries()
        {
            return Registry.Session.CreateCriteria<Country>().List<Country>();
        }

        public IList<State> FindAllStates()
        {
            return Registry.Session.CreateCriteria<State>().List<State>();
        }

        public State FindStateById(int id)
        {
            return Registry.Session.Get<State>(id);
        }

        public State FindStateByCountryAndStateCode(string countryCode, string stateCode)
        {
            if (string.IsNullOrWhiteSpace(stateCode))
            {
                return null;
            }
            return Registry.Session.CreateQuery(@"
                from State s 
                inner join fetch s.Country c
                where (s.DoubleLetterCode = :stateCode or s.TripleLetterCode = :stateCode or s.Name = :stateCode)
                    and (c.DoubleLetterCode = :countryCode or c.TripleLetterCode = :countryCode or c.Name = :countryCode)")
                .SetParameter("stateCode", stateCode)
                .SetParameter("countryCode", countryCode)
                .UniqueResult<State>();
        }

        public IList<State> FindStatesByCountryCode(string code)
        {
            return Registry.Session.CreateQuery(@"
                from State s 
                inner join fetch s.Country c
                where c.DoubleLetterCode = :code or c.TripleLetterCode = :code or c.Name = :code")
                .SetParameter("code", code)
                .SetCacheable(true)
                .List<State>();
        }

        public IEnumerable<State> SearchStates(string expression, int maxResults)
        {
            return Registry.Session.CreateSQLQuery(
@"select state.*
from dbo.SearchStates(:expression) rank
join Locations.States state
    on state.Id = rank.Id
order by rank.Rank desc")
                .AddEntity(typeof(State))
                .SetParameter("expression", expression)
                .SetMaxResults(maxResults)
                .List<State>();
            
        }
    }
}
