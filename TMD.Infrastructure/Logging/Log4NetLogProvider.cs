using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using TMD.Model.Logging;
using log4net;
using System.ComponentModel;

namespace TMD.Infrastructure.Logging
{
    public class Log4NetContextPropertyValueProvider : IConvertible
    {
        public Log4NetContextPropertyValueProvider(Func<object> evaluator) { this.Evaluator = evaluator; }
        public Func<object> Evaluator { get; private set; }
        public override string ToString() { return (Evaluator() ?? string.Empty).ToString(); }

        #region IConvertible implementation

        TypeCode IConvertible.GetTypeCode()
        {
            throw new NotImplementedException();
        }

        bool IConvertible.ToBoolean(IFormatProvider provider)
        {
            object value = Evaluator();
            if (value is bool) { return (bool)value; }
            throw new NotImplementedException();
        }

        byte IConvertible.ToByte(IFormatProvider provider)
        {
            throw new NotImplementedException();
        }

        char IConvertible.ToChar(IFormatProvider provider)
        {
            throw new NotImplementedException();
        }

        DateTime IConvertible.ToDateTime(IFormatProvider provider)
        {
            throw new NotImplementedException();
        }

        decimal IConvertible.ToDecimal(IFormatProvider provider)
        {
            throw new NotImplementedException();
        }

        double IConvertible.ToDouble(IFormatProvider provider)
        {
            throw new NotImplementedException();
        }

        short IConvertible.ToInt16(IFormatProvider provider)
        {
            throw new NotImplementedException();
        }

        int IConvertible.ToInt32(IFormatProvider provider)
        {
            throw new NotImplementedException();
        }

        long IConvertible.ToInt64(IFormatProvider provider)
        {
            throw new NotImplementedException();
        }

        sbyte IConvertible.ToSByte(IFormatProvider provider)
        {
            throw new NotImplementedException();
        }

        float IConvertible.ToSingle(IFormatProvider provider)
        {
            throw new NotImplementedException();
        }

        string IConvertible.ToString(IFormatProvider provider)
        {
            object value = Evaluator();
            if (value == null) { return string.Empty; }
            if (value is string) { return (string)value; }
            return value.ToString();
        }

        object IConvertible.ToType(Type conversionType, IFormatProvider provider)
        {
            throw new NotImplementedException();
        }

        ushort IConvertible.ToUInt16(IFormatProvider provider)
        {
            throw new NotImplementedException();
        }

        uint IConvertible.ToUInt32(IFormatProvider provider)
        {
            throw new NotImplementedException();
        }

        ulong IConvertible.ToUInt64(IFormatProvider provider)
        {
            throw new NotImplementedException();
        }

        #endregion
    }

    public class Log4NetLogProvider : ILogProvider
    {
        private ILog getLog(Type type) { return LogManager.GetLogger(type); }

        public bool IsDebugEnabled(Type type) { return getLog(type).IsDebugEnabled; }
        public void Debug(Type type, object message) { getLog(type).Debug(message); }
        public void Debug(Type type, object message, Exception exception) { getLog(type).Debug(message, exception); }
        public void DebugFormat(Type type, string format, params object[] args) { getLog(type).DebugFormat(format, args); }
        public void DebugFormat(Type type, IFormatProvider provider, string format, params object[] args) { getLog(type).DebugFormat(provider, format, args); }

        public bool IsInfoEnabled(Type type) { return getLog(type).IsInfoEnabled; }
        public void Info(Type type, object message) { getLog(type).Info(message); }
        public void Info(Type type, object message, Exception exception) { getLog(type).Info(message, exception); }
        public void InfoFormat(Type type, string format, params object[] args) { getLog(type).InfoFormat(format, args); }
        public void InfoFormat(Type type, IFormatProvider provider, string format, params object[] args) { getLog(type).InfoFormat(provider, format, args); }

        public bool IsWarnEnabled(Type type) { return getLog(type).IsWarnEnabled; }
        public void Warn(Type type, object message) { getLog(type).Warn(message); }
        public void Warn(Type type, object message, Exception exception) { getLog(type).Warn(message, exception); }
        public void WarnFormat(Type type, string format, params object[] args) { getLog(type).WarnFormat(format, args); }
        public void WarnFormat(Type type, IFormatProvider provider, string format, params object[] args) { getLog(type).WarnFormat(provider, format, args); }

        public bool IsErrorEnabled(Type type) { return getLog(type).IsErrorEnabled; }
        public void Error(Type type, object message) { getLog(type).Error(message); }
        public void Error(Type type, object message, Exception exception) { getLog(type).Error(message, exception); }
        public void ErrorFormat(Type type, string format, params object[] args) { getLog(type).ErrorFormat(format, args); }
        public void ErrorFormat(Type type, IFormatProvider provider, string format, params object[] args) { getLog(type).ErrorFormat(provider, format, args); }

        public bool IsFatalEnabled(Type type) { return getLog(type).IsFatalEnabled; }
        public void Fatal(Type type, object message) { getLog(type).Fatal(message); }
        public void Fatal(Type type, object message, Exception exception) { getLog(type).Fatal(message, exception); }
        public void FatalFormat(Type type, string format, params object[] args) { getLog(type).FatalFormat(format, args); }
        public void FatalFormat(Type type, IFormatProvider provider, string format, params object[] args) { getLog(type).FatalFormat(provider, format, args); }

        public void AddContextProperty(string property, Func<object> evaluator)
        {
            GlobalContext.Properties[property] = new Log4NetContextPropertyValueProvider(evaluator);
        }

        public bool RemoveContextProperty(string property) 
        {
            if (GlobalContext.Properties[property] != null)
            {
                GlobalContext.Properties.Remove(property);
                return true;
            }
            GlobalContext.Properties.Remove(property);
            return false;
        }
        public void ClearContextProperties() { GlobalContext.Properties.Clear(); }
    }
}
