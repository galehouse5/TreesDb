using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.Web.Mvc;
using TMD.Model.Trips;
using TMD.Model;
using TMD.Model.Locations;

namespace TMD.Extensions
{
    public static class ModelExtensions
    {
        public static IEnumerable<SelectListItem> BuildSelectList<T>()
            where T : struct, IComparable, IFormattable, IConvertible
        {
            Array values = Enum.GetValues(typeof(T));
            for (int i = 0; i < values.Length; i++)
            {
                Enum value = (Enum)Enum.ToObject(typeof(T), i);
                string text = value.GetEnumDescription();
                yield return new SelectListItem() 
                {
                    Value = i.ToString(),
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
            return LocationService.FindStateByCountryCodeAndCode("US", stateCode);
        }
    }
}