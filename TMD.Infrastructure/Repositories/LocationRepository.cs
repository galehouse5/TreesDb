using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using TMD.Model.Locations;
using NHibernate;

namespace TMD.Infrastructure.Repositories
{
    public class LocationRepository : ILocationRepository
    {
        public Country FindCountryByCode(string code)
        {
            using (ISession session = Registry.SessionFactory.OpenSession())
            {
                return session.CreateQuery(@"
                    from Country c 
                    where c.DoubleLetterCode = :code or c.TripleLetterCode = :code or c.Name = :code")
                    .SetParameter("code", code)
                    .SetCacheable(true)
                    .UniqueResult<Country>();
            }
        }

        public IList<State> FindStatesByCountryCode(string code)
        {
            using (ISession session = Registry.SessionFactory.OpenSession())
            {
                return session.CreateQuery(@"
                    from State s 
                    inner join fetch s.Country c
                    where c.DoubleLetterCode = :code or c.TripleLetterCode = :code or c.Name = :code")
                    .SetParameter("code", code)
                    .SetCacheable(true)
                    .List<State>();
            }
        }

        public IList<Country> FindAllCountries()
        {
            using (ISession session = Registry.SessionFactory.OpenSession())
            {
                return session.CreateQuery("from Country c")
                    .SetCacheable(true)
                    .List<Country>();
            }
        }

        public State FindStateByCountryAndStateCodes(string countryCode, string stateCode)
        {
            if (string.IsNullOrWhiteSpace(stateCode))
            {
                return null;
            }
            using (ISession session = Registry.SessionFactory.OpenSession())
            {
                return session.CreateQuery(@"
                    from State s 
                    inner join fetch s.Country c
                    where (s.DoubleLetterCode = :stateCode or s.TripleLetterCode = :stateCode or s.Name = :stateCode)
                        and (c.DoubleLetterCode = :countryCode or c.TripleLetterCode = :countryCode or c.Name = :countryCode)")
                    .SetParameter("stateCode", stateCode)
                    .SetParameter("countryCode", countryCode)
                    .SetCacheable(true)
                    .UniqueResult<State>();
            }
        }
    }
}
