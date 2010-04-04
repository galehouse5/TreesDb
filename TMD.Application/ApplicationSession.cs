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
        private const string GoToOnWizardCancelKey = "goToOnWizardCancel";
        private const string GoToOnWizardCompleteKey = "goToOnWizardComplete";
        private const string DialogNumberKey = "dialogNumber";
        private const string CurrentImportTripKey = "currentImportTrip";

        public static Trip CurrentImportTrip
        {
            get { return ApplicationRegistry.ApplicationSessionProvider.GetOrCreate<Trip>(CurrentImportTripKey, (Trip)null); }
            set { ApplicationRegistry.ApplicationSessionProvider.Set<Trip>(CurrentImportTripKey, value); }
        }

        public static InstanceCreationDelegate<object> DefaultGoToOnWizardCancelCreator = delegate() { return null; };
        public static object GoToOnWizardCancel
        {
            get { return ApplicationRegistry.ApplicationSessionProvider.GetOrCreate<object>(GoToOnWizardCancelKey, DefaultGoToOnWizardCancelCreator); }
            set { ApplicationRegistry.ApplicationSessionProvider.Set<object>(GoToOnWizardCancelKey, value); }
        }

        public static InstanceCreationDelegate<object> DefaultGoToOnWizardCompleteCreator = delegate() { return null; };
        public static object GoToOnWizardComplete
        {
            get { return ApplicationRegistry.ApplicationSessionProvider.GetOrCreate<object>(GoToOnWizardCompleteKey, DefaultGoToOnWizardCompleteCreator); }
            set { ApplicationRegistry.ApplicationSessionProvider.Set<object>(GoToOnWizardCompleteKey, value); }
        }

        public static int DialogNumber
        {
            get { return ApplicationRegistry.ApplicationSessionProvider.GetOrCreate<int>(DialogNumberKey, 0); }
            set { ApplicationRegistry.ApplicationSessionProvider.Set<int>(DialogNumberKey, value); }
        }
    }
}
