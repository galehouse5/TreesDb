using System.Web.Mvc;
using TMD.Model.Photo;
using TMD.ModelBinders;

namespace TMD
{
    public class ModelBinderConfig
    {
        public static void RegisterModelBinders(ModelBinderDictionary binders)
        {
            binders.Add(typeof(ImageSize), new ImageSizeModelBinder());
        }
    }
}