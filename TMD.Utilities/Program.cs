﻿using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using TMD.Model;
using TMD.Infrastructure.Repositories;
using TMD.Infrastructure;
using TMD.Model.Logging;
using StructureMap;

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
                    case "-logi":
                        initializeForLogging();
                        string message = args.Length > 1 ? string.Join(" ", args, 1, args.Length - 1)
                            : Console.ReadLine();
                        new Program().Info(message);
                        return;
                }
            }
            Console.WriteLine(string.Empty);
            Console.WriteLine("TMD Utilities");
            Console.WriteLine(string.Empty);
            Console.WriteLine("   -rpo      Remove photos without any photo references.");
            Console.WriteLine("   -rpso     Remove photo store files without any associated photo.");
            Console.WriteLine("   -logi     Logs an info message.");
            Console.WriteLine(string.Empty);
        }

        static void initializeForLogging()
        {
            log4net.Config.XmlConfigurator.Configure();
            ObjectFactory.Initialize(x =>
            {
                x.For<ILogProvider>().Singleton().Use<Log4NetLogProvider>();
            });
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

        static int removePhotoOrphans()
        {
            int orphans = 0;
            using (var uow = UnitOfWork.Begin())
            {
                foreach (var orphan in Repositories.Photos.FindOrphaned())
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
                var store = Repositories.Photos.FindPermanentPhotoStore();
                var knownPhotos = Repositories.Photos.FindAll();
                return store.RemovePhotosCreatedBefore(threshold, knownPhotos);
            }
        }
    }
}