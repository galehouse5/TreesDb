using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.Web.Mvc;

namespace TMD.Binders
{
    public class NullModelBinder : IModelBinder
    {
        public object BindModel(ControllerContext controllerContext, ModelBindingContext bindingContext)
        {
            return null;
        }
    }

    /// <summary>
    /// A DefaultModelBinder that can update complex model graphs.
    /// </summary>
    public class DefaultGraphModelBinder : DefaultModelBinder
    {
        public override object BindModel(ControllerContext controllerContext, ModelBindingContext bindingContext)
        {
            // Bind collections 'our way':
            if ((bindingContext.Model.IsCollection())
                && (bindingContext.Model.CollectionGetCount() > 0))
                return this.BindCollection(controllerContext, bindingContext);
            else
                return base.BindModel(controllerContext, bindingContext);
        }

        private object BindCollection(ControllerContext controllerContext, ModelBindingContext bindingContext)
        {
            object collection = bindingContext.Model;
            Type collectionMemberType = typeof(Object);
            if (collection.GetType().IsGenericType)
                collectionMemberType =
                    collection.GetType().GetGenericArguments()[0];
            int count = collection.CollectionGetCount();
            for (int index = 0; index < count; index++)
            {
                // Create a BindingContext for the collection member:
                ModelBindingContext innerContext = new ModelBindingContext();
                object member = collection.CollectionGetItem(index);
                Type memberType =
                    (member == null) ? collectionMemberType : member.GetType();
                innerContext.ModelMetadata =
                    ModelMetadataProviders.Current.GetMetadataForType(
                        delegate() { return member; },
                        memberType);
                innerContext.ModelName =
                    String.Format("{0}[{1}]", bindingContext.ModelName, index);
                innerContext.ModelState = bindingContext.ModelState;
                innerContext.PropertyFilter = bindingContext.PropertyFilter;
                innerContext.ValueProvider = bindingContext.ValueProvider;

                // Bind the collection member:
                IModelBinder binder = Binders.GetBinder(memberType);
                object boundMember =
                    binder.BindModel(controllerContext, innerContext) ?? member;
                collection.CollectionSetItem(index, boundMember);
            }

            // Return the collection:
            return collection;
        }
    }

    internal static class DefaultModelGraphBinderCollectionExtensions
    {
        public static bool IsCollection(this object obj)
        {
            return (obj != null)
                && (obj.GetType() != typeof(String))
                && (typeof(System.Collections.IEnumerable).IsInstanceOfType(obj));
        }

        public static int CollectionGetCount(this object collection)
        {
            if (collection.GetType().IsArray)
                return ((Array)collection).GetLength(0);
            else
                return (int)collection.GetType().GetProperty("Count")
                    .GetValue(collection, null);
        }

        public static object CollectionGetItem(this object collection, int index)
        {
            if (collection.GetType().IsArray)
                return ((Array)collection).GetValue(index);
            else
                return collection.GetType().GetProperty("Item")
                    .GetValue(collection, new object[] { index });
        }

        public static void CollectionSetItem(this object collection, int index, object value)
        {
            if (collection.GetType().IsArray)
                ((Array)collection).SetValue(value, index);
            else
                collection.GetType().GetProperty("Item")
                    .SetValue(collection, value, new object[] { index });
        }
    }
}