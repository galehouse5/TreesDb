using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Reflection;

namespace TMD.Model
{
    public static class ReflectionExtensions
    {
        public static void SetPrivatePropertyValue(this object obj, string propertyName, object value)
        {
            Type objType = obj.GetType();
            PropertyInfo pi = objType.GetProperty(propertyName, BindingFlags.Instance | BindingFlags.Public | BindingFlags.NonPublic);
            if (pi.DeclaringType != objType)
            {
                objType = pi.DeclaringType;
                pi = objType.GetProperty(propertyName, BindingFlags.Instance | BindingFlags.Public | BindingFlags.NonPublic);
            }
            pi.SetValue(obj, value, null);
        }

        public static void SetPrivatePropertyValue<T>(this object obj, string propertyName, T value)
        {
            Type objType = obj.GetType();
            PropertyInfo pi = objType.GetProperty(propertyName, BindingFlags.Instance | BindingFlags.Public | BindingFlags.NonPublic);
            if (pi.DeclaringType != objType)
            {
                objType = pi.DeclaringType;
                pi = objType.GetProperty(propertyName, BindingFlags.Instance | BindingFlags.Public | BindingFlags.NonPublic);
            }
            pi.SetValue(obj, value, null);
        }

        public static object GetPrivatePropertyValue(this object obj, string propertyName)
        {
            Type objType = obj.GetType();
            PropertyInfo pi = objType.GetProperty(propertyName, BindingFlags.Instance | BindingFlags.Public | BindingFlags.NonPublic);
            return pi.GetValue(objType, null);
        }

        public static T GetPrivatePropertyValue<T>(this object obj, string propertyName)
        {
            Type objType = obj.GetType();
            PropertyInfo pi = objType.GetProperty(propertyName, BindingFlags.Instance | BindingFlags.Public | BindingFlags.NonPublic);
            return (T)pi.GetValue(objType, null);
        }

        public static void SetPrivateFieldValue(this object obj, string memberName, object value)
        {
            Type objType = obj.GetType();
            FieldInfo fi = objType.GetField(memberName, BindingFlags.Instance | BindingFlags.Public | BindingFlags.NonPublic);
            if (fi.DeclaringType != objType)
            {
                objType = fi.DeclaringType;
                fi = objType.GetField(memberName, BindingFlags.Instance | BindingFlags.Public | BindingFlags.NonPublic);
            }
            fi.SetValue(obj, value);
        }

        public static void SetPrivateFieldValue<T>(this object obj, string memberName, T value)
        {
            Type objType = obj.GetType();
            FieldInfo fi = objType.GetField(memberName, BindingFlags.Instance | BindingFlags.Public | BindingFlags.NonPublic);
            if (fi.DeclaringType != objType)
            {
                objType = fi.DeclaringType;
                fi = objType.GetField(memberName, BindingFlags.Instance | BindingFlags.Public | BindingFlags.NonPublic);
            }
            fi.SetValue(obj, value);
        }
    }
}
