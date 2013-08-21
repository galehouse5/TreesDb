using StructureMap;
using System;
using System.Linq;
using TMD.Infrastructure;
using TMD.Infrastructure.Repositories;
using TMD.Model;
using TMD.Model.Photos;
using TMD.Model.Validation;

namespace TMD.Utilities
{
    class Program
    {
        static void Main(string[] args)
        {
            if (args.Length > 0)
            {
                switch (args[0].ToLower())
                {
                    case "-rpo":
                        initializeForPersistence();
                        Console.WriteLine(string.Format("Removed {0} photo orphans.", removePhotoOrphans()));
                        return;
                    case "-rpso":
                        initializeForPersistence();
                        Console.WriteLine(string.Format("Removed {0} photo store orphans.", removeStoreOrphans()));
                        return;
                    case "-rivt":
                        initializeForPersistence();
                        Console.WriteLine(string.Format("Reimported {0} valid trips.", reimportValidTrips()));
                        return;
                    case "-rit":
                        if (args.Length < 2) { break; }
                        int tripId = int.Parse(args[1]);
                        initializeForPersistence();
                        reimportTrip(tripId);
                        Console.WriteLine(string.Format("Reimported trip {0}.", tripId));
                        return;
                }
            }
            Console.WriteLine(string.Empty);
            Console.WriteLine("TMD Utilities");
            Console.WriteLine(string.Empty);
            Console.WriteLine("   -rpo            Remove photos without any photo references.");
            Console.WriteLine("   -rpso           Remove photo store files without any associated photo.");
            Console.WriteLine("   -rivt           Reimport valid trips.");
            Console.WriteLine("   -rit tripId     Reimport valid trips.");
            Console.WriteLine(string.Empty);
        }

        static void initializeForPersistence()
        {
            ObjectFactory.Initialize(x =>
            {
                x.AddRegistry(new RepositoryRegistry());
                x.For<IUnitOfWorkProvider>().Singleton().Use<NHibernateUnitOfWorkProvider>();
                x.For<IUserSessionProvider>().Singleton().Use<NullUserSessionProvider>();
            });
        }

        static int reimportValidTrips()
        {
            using (var uow = UnitOfWork.Begin())
            {
                var validTrips = from trip in Repositories.Imports.ListAll()
                                 where trip.IsValid(ValidationTag.Screening, ValidationTag.Finalization, ValidationTag.Persistence) && trip.IsImported
                                 select trip;
                foreach (var trip in validTrips)
                {
                    Repositories.Trees.RemoveMeasurementsByTrip(trip);
                    Repositories.Sites.RemoveVisitsByTrip(trip);
                }
                foreach (var trip in validTrips)
                {
                    Repositories.Imports.Reimport(trip);
                }
                uow.Persist();
                return validTrips.Count();
            }
        }

        static void reimportTrip(int tripId)
        {
            using (var uow = UnitOfWork.Begin())
            {
                var trip = Repositories.Imports.FindById(tripId);
                Repositories.Imports.Reimport(trip);
                uow.Persist();
            }
        }

        static int removePhotoOrphans()
        {
            int orphans = 0;
            using (var uow = UnitOfWork.Begin())
            {
                foreach (var orphan in Repositories.Photos.ListOrphaned())
                {
                    Repositories.Photos.Remove(orphan);
                    orphans++;
                }
                uow.Persist();
            }
            return orphans;
        }

        static int removeStoreOrphans()
        {
            using (var uow = UnitOfWork.Begin())
            {
                var threshold = DateTime.Now;
                var allParentedPhotos = Repositories.Photos.ListAll();
                return PhotoStoreProvider.Current.RemoveOrphans(allParentedPhotos);
            }
        }
    }
}
