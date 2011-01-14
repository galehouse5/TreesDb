using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using TMD.Model.Sites;
using TMD.Model;
using NHibernate.Criterion;
using TMD.Model.Extensions;

namespace TMD.Infrastructure.Repositories
{
    public class SiteRepository : ISiteRepository
    {
        public void Save(Site site)
        {
            Registry.Session.Save(site);
        }

        public Site FindById(int id)
        {
            return Registry.Session.Get<Site>(id);
        }

        public void Merge(Site site)
        {
            var candidateSites = ListByProximity(site.CalculatedCoordinates, Site.CoordinateMinutesEquivalenceProximity);
            foreach (var candidateSite in candidateSites)
            {
                if (candidateSite.ShouldMerge(site))
                {
                    candidateSite.Merge(site);
                    Registry.Session.Save(candidateSite);
                    return;
                }
            }
            Registry.Session.Save(site);
        }

        public IList<Site> ListByProximity(Coordinates coordinates, float minutesDistance)
        {
            return Registry.Session.CreateCriteria<Site>()
                .Add(Expression.Conjunction()
                    .Add(Expression.Le("CalculatedCoordinates.Latitude.TotalDegrees", coordinates.Latitude.AddMinutes(minutesDistance).TotalDegrees))
                    .Add(Expression.Ge("CalculatedCoordinates.Latitude.TotalDegrees", coordinates.Latitude.SubtractMinutes(minutesDistance).TotalDegrees))
                    .Add(Expression.Le("CalculatedCoordinates.Longitude.TotalDegrees", coordinates.Longitude.AddMinutes(minutesDistance).TotalDegrees))
                    .Add(Expression.Ge("CalculatedCoordinates.Longitude.TotalDegrees", coordinates.Longitude.SubtractMinutes(minutesDistance).TotalDegrees))
                ).List<Site>();
        }

        public IList<Site> ListAll()
        {
            return Registry.Session.CreateCriteria<Site>()
                .List<Site>();
        }

        public void RemoveVisitsByTrip(Model.Imports.Trip trip)
        {
            var subsites = Registry.Session.CreateCriteria<Subsite>()
                .CreateAlias("Visits", "visit")
                .CreateAlias("visit.ImportingTrip", "importingTrip")
                .Add(Restrictions.Eq("importingTrip.Id", trip.Id))
                .List<Subsite>();
            foreach (var subsite in subsites)
            {
                subsite.Visits.RemoveAll(visit => visit.ImportingTrip.Equals(trip));
                if (subsite.Visits.Count < 1)
                {
                    Registry.Session.Delete(subsite);
                }
            }
            var sites = Registry.Session.CreateCriteria<Site>()
                .CreateAlias("Visits", "visit")
                .CreateAlias("visit.ImportingTrip", "importingTrip")
                .Add(Restrictions.Eq("importingTrip.Id", trip.Id))
                .List<Site>();
            foreach (var site in sites)
            {
                site.Visits.RemoveAll(visit => visit.ImportingTrip.Equals(trip));
                if (site.Visits.Count < 1)
                {
                    Registry.Session.Delete(site);
                }
            }
        }
    }
}
