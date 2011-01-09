using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.Web.Mvc;
using TMD.Model;
using TMD.Model.Locations;

namespace TMD.Binders
{
    public class ValueObjectBinders
    {
        public void Bind(ModelBinderDictionary binders)
        {
            binders.Add(typeof(Coordinates), new CoordinatesModelBinder());
            binders.Add(typeof(State), new StateModelBinder());
            binders.Add(typeof(Country), new CountryModelBinder());
            binders.Add(typeof(Elevation), new ElevationModelBinder());
            binders.Add(typeof(Distance), new DistanceModelBinder());
            binders.Add(typeof(Volume), new VolumeModelBinder());
            binders.Add(typeof(HeightMeasurements), new HeightMeasurementModelBinder());
        }
    }

    public class CoordinatesModelBinder : IModelBinder
    {
        public object BindModel(ControllerContext controllerContext, ModelBindingContext bindingContext)
        {
            string value = bindingContext.ValueProvider.GetValue(bindingContext.ModelName).AttemptedValue;
            return Coordinates.Create(value);
        }
    }

    public class StateModelBinder : IModelBinder
    {
        public object BindModel(ControllerContext controllerContext, ModelBindingContext bindingContext)
        {
            string stateId = bindingContext.ValueProvider.GetValue(bindingContext.ModelName).AttemptedValue;
            return Repositories.Locations.FindStateById(Convert.ToInt32(stateId));
        }
    }

    public class CountryModelBinder : IModelBinder
    {
        public object BindModel(ControllerContext controllerContext, ModelBindingContext bindingContext)
        {
            string countryCode = bindingContext.ValueProvider.GetValue(bindingContext.ModelName).AttemptedValue;
            return Repositories.Locations.FindCountryByCode(countryCode);
        }
    }

    public class ElevationModelBinder : IModelBinder
    {
        public object BindModel(ControllerContext controllerContext, ModelBindingContext bindingContext)
        {
            string value = bindingContext.ValueProvider.GetValue(bindingContext.ModelName).AttemptedValue;
            return Elevation.Create(value);
        }
    }

    public class DistanceModelBinder : IModelBinder
    {
        public object BindModel(ControllerContext controllerContext, ModelBindingContext bindingContext)
        {
            string value = bindingContext.ValueProvider.GetValue(bindingContext.ModelName).AttemptedValue;
            return Distance.Create(value);
        }
    }

    public class VolumeModelBinder : IModelBinder
    {
        public object BindModel(ControllerContext controllerContext, ModelBindingContext bindingContext)
        {
            string value = bindingContext.ValueProvider.GetValue(bindingContext.ModelName).AttemptedValue;
            return Volume.Create(value);
        }
    }

    public class HeightMeasurementModelBinder : IModelBinder
    {
        public object BindModel(ControllerContext controllerContext, ModelBindingContext bindingContext)
        {
            string distanceTopModelName = string.Format("{0}.DistanceTop", bindingContext.ModelName);
            Distance distanceTop = Distance.Create(bindingContext.ValueProvider.GetValue(distanceTopModelName).AttemptedValue);
            string angleTopModelName = string.Format("{0}.AngleTop", bindingContext.ModelName);
            Angle angleTop = Angle.Create(bindingContext.ValueProvider.GetValue(angleTopModelName).AttemptedValue);
            string distanceBottomModelName = string.Format("{0}.DistanceBottom", bindingContext.ModelName);
            Distance distanceBottom = Distance.Create(bindingContext.ValueProvider.GetValue(distanceBottomModelName).AttemptedValue);
            string angleBottomModelName = string.Format("{0}.AngleBottom", bindingContext.ModelName);
            Angle angleBottom = Angle.Create(bindingContext.ValueProvider.GetValue(angleBottomModelName).AttemptedValue);
            string verticalOffsetModelName = string.Format("{0}.VerticalOffset", bindingContext.ModelName);
            DirectedDistance verticalOffset = DirectedDistance.Create(bindingContext.ValueProvider.GetValue(verticalOffsetModelName).AttemptedValue);
            return HeightMeasurements.Create(distanceTop, angleTop, distanceBottom, angleBottom, verticalOffset);
        }
    }
}