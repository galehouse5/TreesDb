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
            using (ISession session = InfrastructureRegistry.SessionFactory.OpenSession())
            {
                return session.CreateQuery("from Country c where c.Code = :code")
                    .SetParameter("code", code)
                    .SetCacheable(true)
                    .UniqueResult<Country>();
            }
        }

        public IList<State> FindStatesByCountryCode(string countryCode)
        {
            using (ISession session = InfrastructureRegistry.SessionFactory.OpenSession())
            {
                return session.CreateQuery(@"
                    from State s 
                    inner join fetch s.Country
                    where s.Country.Code = :countryCode")
                    .SetParameter("countryCode", countryCode)
                    .SetCacheable(true)
                    .List<State>();
            }
        }

        public IList<Country> FindAllCountries()
        {
            using (ISession session = InfrastructureRegistry.SessionFactory.OpenSession())
            {
                return session.CreateQuery("from Country c")
                    .SetCacheable(true)
                    .List<Country>();
            }
        }

        public State FindStateByCountryCodeAndCode(string countryCode, string code)
        {
            using (ISession session = InfrastructureRegistry.SessionFactory.OpenSession())
            {
                return session.CreateQuery(@"
                    from State s 
                    inner join fetch s.Country
                    where s.Code = :code and s.Country.Code = :countryCode")
                    .SetParameter("code", code)
                    .SetParameter("countryCode", countryCode)
                    .SetCacheable(true)
                    .UniqueResult<State>();
            }
        }
    }
}
