using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using StructureMap;

namespace TMD.Model.Logging
{
    public interface ILogProvider
    {
        bool IsDebugEnabled(string @namespace);
        void Debug(string @namespace, object message);
        void Debug(string @namespace, object message, Exception exception);
        void DebugFormat(string @namespace, string format, params object[] args);
        void DebugFormat(string @namespace, IFormatProvider provider, string format, params object[] args);

        bool IsInfoEnabled(string @namespace);
        void Info(string @namespace, object message);
        void Info(string @namespace, object message, Exception exception);
        void InfoFormat(string @namespace, string format, params object[] args);
        void InfoFormat(string @namespace, IFormatProvider provider, string format, params object[] args);

        bool IsWarnEnabled(string @namespace);
        void Warn(string @namespace, object message);
        void Warn(string @namespace, object message, Exception exception);
        void WarnFormat(string @namespace, string format, params object[] args);
        void WarnFormat(string @namespace, IFormatProvider provider, string format, params object[] args);

        bool IsErrorEnabled(string @namespace);
        void Error(string @namespace, object message);
        void Error(string @namespace, object message, Exception exception);
        void ErrorFormat(string @namespace, string format, params object[] args);
        void ErrorFormat(string @namespace, IFormatProvider provider, string format, params object[] args);

        bool IsFatalEnabled(string @namespace);
        void Fatal(string @namespace, object message);
        void Fatal(string @namespace, object message, Exception exception);
        void FatalFormat(string @namespace, string format, params object[] args);
        void FatalFormat(string @namespace, IFormatProvider provider, string format, params object[] args);

        void AddContextProperty(string property, Func<object> evaluator);
        bool RemoveContextProperty(string property);
        void ClearContextProperties();
    }
}
