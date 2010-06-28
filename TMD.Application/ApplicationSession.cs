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
        public static class Keys
        {
            public const string GoToOnWizardCancelKey = "goToOnWizardCancel";
            public const string GoToOnWizardCompleteKey = "goToOnWizardComplete";
            public const string DialogNumberKey = "dialogNumber";
            public const string ImportTripIdKey = "importTripId";
            public const string ImportSelectedSiteVisitIndexKey = "importSelectedSiteVisitIndex";
            public const string ImportSelectedSubsiteVisitIndexKey = "importSelectedSubsiteVisitIndex";
            public const string ImportSelectedMeasurementIndexKey = "importSelectedMeasurementIndex";
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
    }
}
