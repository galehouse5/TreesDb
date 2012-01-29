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
        private ILog getLog(string @namespace) { return LogManager.GetLogger(@namespace); }

        public bool IsDebugEnabled(string @namespace) { return getLog(@namespace).IsDebugEnabled; }
        public void Debug(string @namespace, object message) { getLog(@namespace).Debug(message); }
        public void Debug(string @namespace, object message, Exception exception) { getLog(@namespace).Debug(message, exception); }
        public void DebugFormat(string @namespace, string format, params object[] args) { getLog(@namespace).DebugFormat(format, args); }
        public void DebugFormat(string @namespace, IFormatProvider provider, string format, params object[] args) { getLog(@namespace).DebugFormat(provider, format, args); }

        public bool IsInfoEnabled(string @namespace) { return getLog(@namespace).IsInfoEnabled; }
        public void Info(string @namespace, object message) { getLog(@namespace).Info(message); }
        public void Info(string @namespace, object message, Exception exception) { getLog(@namespace).Info(message, exception); }
        public void InfoFormat(string @namespace, string format, params object[] args) { getLog(@namespace).InfoFormat(format, args); }
        public void InfoFormat(string @namespace, IFormatProvider provider, string format, params object[] args) { getLog(@namespace).InfoFormat(provider, format, args); }

        public bool IsWarnEnabled(string @namespace) { return getLog(@namespace).IsWarnEnabled; }
        public void Warn(string @namespace, object message) { getLog(@namespace).Warn(message); }
        public void Warn(string @namespace, object message, Exception exception) { getLog(@namespace).Warn(message, exception); }
        public void WarnFormat(string @namespace, string format, params object[] args) { getLog(@namespace).WarnFormat(format, args); }
        public void WarnFormat(string @namespace, IFormatProvider provider, string format, params object[] args) { getLog(@namespace).WarnFormat(provider, format, args); }

        public bool IsErrorEnabled(string @namespace) { return getLog(@namespace).IsErrorEnabled; }
        public void Error(string @namespace, object message) { getLog(@namespace).Error(message); }
        public void Error(string @namespace, object message, Exception exception) { getLog(@namespace).Error(message, exception); }
        public void ErrorFormat(string @namespace, string format, params object[] args) { getLog(@namespace).ErrorFormat(format, args); }
        public void ErrorFormat(string @namespace, IFormatProvider provider, string format, params object[] args) { getLog(@namespace).ErrorFormat(provider, format, args); }

        public bool IsFatalEnabled(string @namespace) { return getLog(@namespace).IsFatalEnabled; }
        public void Fatal(string @namespace, object message) { getLog(@namespace).Fatal(message); }
        public void Fatal(string @namespace, object message, Exception exception) { getLog(@namespace).Fatal(message, exception); }
        public void FatalFormat(string @namespace, string format, params object[] args) { getLog(@namespace).FatalFormat(format, args); }
        public void FatalFormat(string @namespace, IFormatProvider provider, string format, params object[] args) { getLog(@namespace).FatalFormat(provider, format, args); }

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
