using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.Web.Mvc;
using TMD.Model.Trips;
using TMD.Model;
using TMD.Model.Locations;
using TMD.Model.Extensions;

namespace TMD.Extensions
{
    public static class ModelExtensions
    {
        public static IEnumerable<SelectListItem> BuildSelectList<T>()
            where T : struct, IComparable, IFormattable, IConvertible
        {
            string[] names = Enum.GetNames(typeof(T));
            for (int i = 0; i < names.Length; i++)
            {
                string name = names[i];
                Enum value = (Enum)Enum.Parse(typeof(T), name);
                string text = value.Describe();
                yield return new SelectListItem() 
                {
                    Value = name,
                    Text = text
                };
            }
        }
    }

    public class CoordinatesModelBinder : IModelBinder
    {
        public object BindModel(ControllerContext controllerContext, ModelBindingContext bindingContext)
        {
            string latitudeModelName = string.Format("{0}.Latitude", bindingContext.ModelName);
            Latitude latitude = Latitude.Create(bindingContext.ValueProvider.GetValue(latitudeModelName).AttemptedValue);
            string longitudeModelName = string.Format("{0}.Longitude", bindingContext.ModelName);
            Longitude longitude = Longitude.Create(bindingContext.ValueProvider.GetValue(longitudeModelName).AttemptedValue);
            return Coordinates.Create(latitude, longitude);
        }
    }

    public class StateModelBinder : IModelBinder
    {
        public object BindModel(ControllerContext controllerContext, ModelBindingContext bindingContext)
        {
            string stateCode = bindingContext.ValueProvider.GetValue(bindingContext.ModelName).AttemptedValue;
            string countryCodeModelName = bindingContext.ModelName.Replace(".State", ".Country");
            string countryCode = bindingContext.ValueProvider.GetValue(countryCodeModelName).AttemptedValue;
            return Repositories.Locations.FindStateByCountryAndStateCodes(countryCode, stateCode);
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