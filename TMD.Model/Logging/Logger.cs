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
        private static Type getType(this object source) { return source is Type ? (Type)source : source.GetType(); }

        public static bool IsDebugEnabled(this object source) { return Provider.IsDebugEnabled(getType(source)); }
        public static void Debug(this object source, object message) { Provider.Debug(getType(source), message); }
        public static void Debug(this object source, object message, Exception exception) { Provider.Debug(getType(source), message, exception); }
        public static void DebugFormat(this object source, string format, params object[] args) { Provider.DebugFormat(getType(source), format, args); }
        public static void DebugFormat(this object source, IFormatProvider provider, string format, params object[] args) { Provider.DebugFormat(getType(source), provider, format, args); }

        public static bool IsInfoEnabled(this object source) { return Provider.IsInfoEnabled(getType(source)); }
        public static void Info(this object source, object message) { Provider.Info(getType(source), message); }
        public static void Info(this object source, object message, Exception exception) { Provider.Info(getType(source), message, exception); }
        public static void InfoFormat(this object source, string format, params object[] args) { Provider.InfoFormat(getType(source), format, args); }
        public static void InfoFormat(this object source, IFormatProvider provider, string format, params object[] args) { Provider.InfoFormat(getType(source), provider, format, args); }

        public static bool IsWarnEnabled(this object source) { return Provider.IsWarnEnabled(getType(source)); }
        public static void Warn(this object source, object message) { Provider.Warn(getType(source), message); }
        public static void Warn(this object source, object message, Exception exception) { Provider.Warn(getType(source), message, exception); }
        public static void WarnFormat(this object source, string format, params object[] args) { Provider.WarnFormat(getType(source), format, args); }
        public static void WarnFormat(this object source, IFormatProvider provider, string format, params object[] args) { Provider.WarnFormat(getType(source), provider, format, args); }

        public static bool IsErrorEnabled(this object source) { return Provider.IsErrorEnabled(getType(source)); }
        public static void Error(this object source, object message) { Provider.Error(getType(source), message); }
        public static void Error(this object source, object message, Exception exception) { Provider.Error(getType(source), message, exception); }
        public static void ErrorFormat(this object source, string format, params object[] args) { Provider.ErrorFormat(getType(source), format, args); }
        public static void ErrorFormat(this object source, IFormatProvider provider, string format, params object[] args) { Provider.ErrorFormat(getType(source), provider, format, args); }

        public static bool IsFatalEnabled(this object source) { return Provider.IsFatalEnabled(getType(source)); }
        public static void Fatal(this object source, object message) { Provider.Fatal(getType(source), message); }
        public static void Fatal(this object source, object message, Exception exception) { Provider.Fatal(getType(source), message, exception); }
        public static void FatalFormat(this object source, string format, params object[] args) { Provider.FatalFormat(getType(source), format, args); }
        public static void FatalFormat(this object source, IFormatProvider provider, string format, params object[] args) { Provider.FatalFormat(getType(source), provider, format, args); }

        public static void AddContextProperty(string property, Func<string> evaluator) { Provider.AddContextProperty(property, evaluator); }
        public static bool RemoveContextProperty(string property) { return Provider.RemoveContextProperty(property); }
        public static void ClearContextProperties() { Provider.ClearContextProperties(); }
    }
}
