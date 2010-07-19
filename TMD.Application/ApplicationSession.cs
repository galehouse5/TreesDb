using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using TMD.Model;
using TMD.Model.Trips;

namespace TMD.Application
{
    public static class ApplicationSession
    {
        private static class Keys
        {
            public const string ImportTripIdKey = "importTripId";
            public const string ImportSelectedSiteVisitIndexKey = "importSelectedSiteVisitIndex";
            public const string ImportSelectedSubsiteVisitIndexKey = "importSelectedSubsiteVisitIndex";
            public const string ImportSelectedMeasurementIndexKey = "importSelectedMeasurementIndex";
            public const string DefaultAction = "defaultAction";
            public const string DefaultController = "defaultController";
            public const string StatusMessage = "statusMessage";
        }

        public static int ImportTripId
        {
            get { return ApplicationRegistry.ApplicationSessionProvider.GetOrCreate<int>(Keys.ImportTripIdKey, -1); }
            set { ApplicationRegistry.ApplicationSessionProvider.Set(Keys.ImportTripIdKey, value); }
        }

        public static int ImportSelectedSiteVisitIndex
        {
            get { return ApplicationRegistry.ApplicationSessionProvider.GetOrCreate<int>(Keys.ImportSelectedSiteVisitIndexKey, -1); }
            set { ApplicationRegistry.ApplicationSessionProvider.Set(Keys.ImportSelectedSiteVisitIndexKey, value); }
        }

        public static int ImportSelectedSubsiteVisitIndex
        {
            get { return ApplicationRegistry.ApplicationSessionProvider.GetOrCreate<int>(Keys.ImportSelectedSubsiteVisitIndexKey, -1); }
            set { ApplicationRegistry.ApplicationSessionProvider.Set(Keys.ImportSelectedSubsiteVisitIndexKey, value); }
        }

        public static int ImportSelectedMeasurementIndex
        {
            get { return ApplicationRegistry.ApplicationSessionProvider.GetOrCreate<int>(Keys.ImportSelectedMeasurementIndexKey, -1); }
            set { ApplicationRegistry.ApplicationSessionProvider.Set(Keys.ImportSelectedMeasurementIndexKey, value); }
        }

        public static string DefaultAction
        {
            get { return ApplicationRegistry.ApplicationSessionProvider.GetOrCreate<string>(Keys.DefaultAction, "Index"); }
            set { ApplicationRegistry.ApplicationSessionProvider.Set(Keys.DefaultAction, value); }
        }

        public static string DefaultController
        {
            get { return ApplicationRegistry.ApplicationSessionProvider.GetOrCreate<string>(Keys.DefaultController, "Main"); }
            set { ApplicationRegistry.ApplicationSessionProvider.Set(Keys.DefaultController, value); }
        }

        public static string StatusMessage
        {
            get { return ApplicationRegistry.ApplicationSessionProvider.GetOrCreate<string>(Keys.StatusMessage, (string)null); }
            set { ApplicationRegistry.ApplicationSessionProvider.Set(Keys.StatusMessage, value); }
        }

        public static bool HasStatusMessage()
        {
            return !string.IsNullOrWhiteSpace(StatusMessage);
        }

        public static string GetAndClearStatusMessage()
        {
            string statusMessage = StatusMessage;
            StatusMessage = null;
            return statusMessage;
        }
    }
}
