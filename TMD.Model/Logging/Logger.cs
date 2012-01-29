using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using StructureMap;

namespace TMD.Model.Logging
{
    public static class Logger
    {
        public static ILogProvider Provider { get { return ObjectFactory.GetInstance<ILogProvider>(); } }

        private static string getNamespace(this object source)
        {
            if (source is string)
            {
                return (string)source;
            }
            if (source is Type)
            {
                return source.ToString();
            }
            return source.GetType().ToString();
        }

        public static bool IsDebugEnabled(this object source) { return Provider.IsDebugEnabled(getNamespace(source)); }
        public static void Debug(this object source, object message) { Provider.Debug(getNamespace(source), message); }
        public static void Debug(this object source, object message, Exception exception) { Provider.Debug(getNamespace(source), message, exception); }
        public static void DebugFormat(this object source, string format, params object[] args) { Provider.DebugFormat(getNamespace(source), format, args); }
        public static void DebugFormat(this object source, IFormatProvider provider, string format, params object[] args) { Provider.DebugFormat(getNamespace(source), provider, format, args); }

        public static bool IsInfoEnabled(this object source) { return Provider.IsInfoEnabled(getNamespace(source)); }
        public static void Info(this object source, object message) { Provider.Info(getNamespace(source), message); }
        public static void Info(this object source, object message, Exception exception) { Provider.Info(getNamespace(source), message, exception); }
        public static void InfoFormat(this object source, string format, params object[] args) { Provider.InfoFormat(getNamespace(source), format, args); }
        public static void InfoFormat(this object source, IFormatProvider provider, string format, params object[] args) { Provider.InfoFormat(getNamespace(source), provider, format, args); }

        public static bool IsWarnEnabled(this object source) { return Provider.IsWarnEnabled(getNamespace(source)); }
        public static void Warn(this object source, object message) { Provider.Warn(getNamespace(source), message); }
        public static void Warn(this object source, object message, Exception exception) { Provider.Warn(getNamespace(source), message, exception); }
        public static void WarnFormat(this object source, string format, params object[] args) { Provider.WarnFormat(getNamespace(source), format, args); }
        public static void WarnFormat(this object source, IFormatProvider provider, string format, params object[] args) { Provider.WarnFormat(getNamespace(source), provider, format, args); }

        public static bool IsErrorEnabled(this object source) { return Provider.IsErrorEnabled(getNamespace(source)); }
        public static void Error(this object source, object message) { Provider.Error(getNamespace(source), message); }
        public static void Error(this object source, object message, Exception exception) { Provider.Error(getNamespace(source), message, exception); }
        public static void ErrorFormat(this object source, string format, params object[] args) { Provider.ErrorFormat(getNamespace(source), format, args); }
        public static void ErrorFormat(this object source, IFormatProvider provider, string format, params object[] args) { Provider.ErrorFormat(getNamespace(source), provider, format, args); }

        public static bool IsFatalEnabled(this object source) { return Provider.IsFatalEnabled(getNamespace(source)); }
        public static void Fatal(this object source, object message) { Provider.Fatal(getNamespace(source), message); }
        public static void Fatal(this object source, object message, Exception exception) { Provider.Fatal(getNamespace(source), message, exception); }
        public static void FatalFormat(this object source, string format, params object[] args) { Provider.FatalFormat(getNamespace(source), format, args); }
        public static void FatalFormat(this object source, IFormatProvider provider, string format, params object[] args) { Provider.FatalFormat(getNamespace(source), provider, format, args); }

        public static void AddContextProperty(string property, Func<string> evaluator) { Provider.AddContextProperty(property, evaluator); }
        public static bool RemoveContextProperty(string property) { return Provider.RemoveContextProperty(property); }
        public static void ClearContextProperties() { Provider.ClearContextProperties(); }
    }
}
