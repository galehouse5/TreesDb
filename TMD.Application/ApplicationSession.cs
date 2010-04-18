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
            public const string ImportTripKey = "importTrip";
        }

        public static Trip ImportTrip
        {
            get { return ApplicationRegistry.ApplicationSessionProvider.GetOrCreate<Trip>(Keys.ImportTripKey, () => Trip.Create()); }
            set { ApplicationRegistry.ApplicationSessionProvider.Set(Keys.ImportTripKey, value); }
        }

        public static InstanceCreationDelegate<object> DefaultGoToOnWizardCancelCreator = delegate() { return null; };
        public static object GoToOnWizardCancel
        {
            get { return ApplicationRegistry.ApplicationSessionProvider.GetOrCreate<object>(Keys.GoToOnWizardCancelKey, DefaultGoToOnWizardCancelCreator); }
            set { ApplicationRegistry.ApplicationSessionProvider.Set(Keys.GoToOnWizardCancelKey, value); }
        }

        public static InstanceCreationDelegate<object> DefaultGoToOnWizardCompleteCreator = delegate() { return null; };
        public static object GoToOnWizardComplete
        {
            get { return ApplicationRegistry.ApplicationSessionProvider.GetOrCreate<object>(Keys.GoToOnWizardCompleteKey, DefaultGoToOnWizardCompleteCreator); }
            set { ApplicationRegistry.ApplicationSessionProvider.Set(Keys.GoToOnWizardCompleteKey, value); }
        }

        public static int DialogNumber
        {
            get { return ApplicationRegistry.ApplicationSessionProvider.GetOrCreate<int>(Keys.DialogNumberKey, 0); }
            set { ApplicationRegistry.ApplicationSessionProvider.Set(Keys.DialogNumberKey, value); }
        }
    }
}
