using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using TMD.Model;
using TMD.Model.Trips;

namespace TMD.Application
{
    public static class UserSession
    {
        private const string CurrentUserIDKey = "currentUserID";
        private const string GoToOnWizardCancelKey = "goToOnWizardCancel";
        private const string GoToOnWizardCompleteKey = "goToOnWizardComplete";
        private const string DialogNumberKey = "dialogNumber";
        private const string CurrentImportTripKey = "currentImportTrip";

        public static IUnitOfWork UnitOfWork
        {
            get { return ApplicationRegistry.UserSessionProvider.UnitOfWork; }
        }

        public static Trip CurrentImportTrip
        {
            get { return ApplicationRegistry.UserSessionProvider.GetOrCreate<Trip>(CurrentImportTripKey, (Trip)null); }
            set { ApplicationRegistry.UserSessionProvider.Set<Trip>(CurrentImportTripKey, value); }
        }

        public static InstanceCreationDelegate<Guid> DefaultCurrentUserIDCreator = delegate() { return Guid.Empty; };
        public static Guid CurrentUserID
        {
            get { return ApplicationRegistry.UserSessionProvider.GetOrCreate<Guid>(CurrentUserIDKey, DefaultCurrentUserIDCreator); }
            set { ApplicationRegistry.UserSessionProvider.Set<Guid>(CurrentUserIDKey, value); }
        }

        public static InstanceCreationDelegate<object> DefaultGoToOnWizardCancelCreator = delegate() { return null; };
        public static object GoToOnWizardCancel
        {
            get { return ApplicationRegistry.UserSessionProvider.GetOrCreate<object>(GoToOnWizardCancelKey, DefaultGoToOnWizardCancelCreator); }
            set { ApplicationRegistry.UserSessionProvider.Set<object>(GoToOnWizardCancelKey, value); }
        }

        public static InstanceCreationDelegate<object> DefaultGoToOnWizardCompleteCreator = delegate() { return null; };
        public static object GoToOnWizardComplete
        {
            get { return ApplicationRegistry.UserSessionProvider.GetOrCreate<object>(GoToOnWizardCompleteKey, DefaultGoToOnWizardCompleteCreator); }
            set { ApplicationRegistry.UserSessionProvider.Set<object>(GoToOnWizardCompleteKey, value); }
        }

        public static int DialogNumber
        {
            get { return ApplicationRegistry.UserSessionProvider.GetOrCreate<int>(DialogNumberKey, 0); }
            set { ApplicationRegistry.UserSessionProvider.Set<int>(DialogNumberKey, value); }
        }
    }
}
