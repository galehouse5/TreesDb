using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using StructureMap;

namespace TMD.Model.Logging
{
    public interface ILogProvider
    {
        bool IsDebugEnabled(Type type);
        void Debug(Type type, object message);
        void Debug(Type type, object message, Exception exception);
        void DebugFormat(Type type, string format, params object[] args);
        void DebugFormat(Type type, IFormatProvider provider, string format, params object[] args);

        bool IsInfoEnabled(Type type);
        void Info(Type type, object message);
        void Info(Type type, object message, Exception exception);
        void InfoFormat(Type type, string format, params object[] args);
        void InfoFormat(Type type, IFormatProvider provider, string format, params object[] args);

        bool IsWarnEnabled(Type type);
        void Warn(Type type, object message);
        void Warn(Type type, object message, Exception exception);
        void WarnFormat(Type type, string format, params object[] args);
        void WarnFormat(Type type, IFormatProvider provider, string format, params object[] args);

        bool IsErrorEnabled(Type type);
        void Error(Type type, object message);
        void Error(Type type, object message, Exception exception);
        void ErrorFormat(Type type, string format, params object[] args);
        void ErrorFormat(Type type, IFormatProvider provider, string format, params object[] args);

        bool IsFatalEnabled(Type type);
        void Fatal(Type type, object message);
        void Fatal(Type type, object message, Exception exception);
        void FatalFormat(Type type, string format, params object[] args);
        void FatalFormat(Type type, IFormatProvider provider, string format, params object[] args);
    }
}
