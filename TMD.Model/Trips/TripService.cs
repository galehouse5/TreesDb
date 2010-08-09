﻿using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using Microsoft.Practices.Unity;

namespace TMD.Model.Trips
{
    public interface ITripRepository
    {
        void Save(Trip t);
        Trip FindById(int id);
        void Remove(Trip t);

        IList<Trip> FindAlreadyImportedTripsByUserId(int userId);
        IList<Trip> FindNotYetImportedTripsByUserId(int userId);
        Trip FindLastSavedTripNotYetImportedByUserId(int userId);
    }

    public static class TripService
    {
        private static ITripRepository m_Repository = ModelRegistry.RepositoryFactory.Resolve<ITripRepository>();

        public static void Save(Trip t)
        {
            if (t.IsImported)
            {
                throw new ApplicationException("Unable to save trip because it has already been imported.");
            }
            if (!t.ValidateRegardingPersistence().IsValid)
            {
                throw new ApplicationException("Unable to save trip due to validation failure.");
            }
            t.SetPrivatePropertyValue<DateTime>("LastSaved", DateTime.Now);
            m_Repository.Save(t);
        }

        public static Trip FindById(int id)
        {
            return m_Repository.FindById(id);
        }

        public static void Remove(Trip t)
        {
            if (t.IsImported)
            {
                throw new ApplicationException("Unable to remove trip because it has already been imported.");
            }
            m_Repository.Remove(t);
        }

        public static IList<Trip> FindAlreadyImportedTripsByUserId(int userId)
        {
            return m_Repository.FindAlreadyImportedTripsByUserId(userId);
        }

        public static IList<Trip> FindNotYetImportedTripsByUserId(int userId)
        {
            return m_Repository.FindNotYetImportedTripsByUserId(userId);
        }

        public static Trip FindLastSavedTripNotYetImportedByUserId(int userId)
        {
            return m_Repository.FindLastSavedTripNotYetImportedByUserId(userId);
        }
    }
}
