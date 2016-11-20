using System;
using System.Reflection;

namespace TMD.Model.Extensions
{
    public static class ReflectionExtensions
    {
        public static object SetPrivatePropertyValue(this object obj, string propertyName, object value)
        {
            Type objType = obj.GetType();
            PropertyInfo pi = objType.GetProperty(propertyName, BindingFlags.Instance | BindingFlags.Public | BindingFlags.NonPublic);
            if (pi.DeclaringType != objType)
            {
                objType = pi.DeclaringType;
                pi = objType.GetProperty(propertyName, BindingFlags.Instance | BindingFlags.Public | BindingFlags.NonPublic);
            }
            pi.SetValue(obj, value, null);
            return obj;
        }

        public static object GetPrivatePropertyValue(this object obj, string propertyName)
        {
            Type objType = obj.GetType();
            PropertyInfo pi = objType.GetProperty(propertyName, BindingFlags.Instance | BindingFlags.Public | BindingFlags.NonPublic);
            return pi.GetValue(objType, null);
        }

        public static object SetPrivateFieldValue(this object obj, string memberName, object value)
        {
            Type objType = obj.GetType();
            FieldInfo fi = objType.GetField(memberName, BindingFlags.Instance | BindingFlags.Public | BindingFlags.NonPublic);
            if (fi.DeclaringType != objType)
            {
                objType = fi.DeclaringType;
                fi = objType.GetField(memberName, BindingFlags.Instance | BindingFlags.Public | BindingFlags.NonPublic);
            }
            fi.SetValue(obj, value);
            return obj;
        }

        public static T CopyPublicPropertyValuesFrom<T>(this T destination, T source) where T : IEntity
        {
            PropertyInfo[] properties = typeof(T).GetProperties();
            foreach (PropertyInfo property in properties)
            {
                if (property.CanWrite)
                {
                    object value = property.GetValue(source, null);
                    property.SetValue(destination, value, null);
                }
            }
            return destination;
        }
    }
}
