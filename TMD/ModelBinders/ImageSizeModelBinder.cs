using System.Linq;
using System.Web.Mvc;
using TMD.Model.Photo;

namespace TMD.ModelBinders
{
    public class ImageSizeModelBinder : IModelBinder
    {
        public object BindModel(ControllerContext controllerContext, ModelBindingContext bindingContext)
        {
            ValueProviderResult value = bindingContext.ValueProvider.GetValue(bindingContext.ModelName);
            if (value == null) return null;

            return ImageSize.All.SingleOrDefault(s => s.Name.Equals(value.AttemptedValue));
        }
    }
}