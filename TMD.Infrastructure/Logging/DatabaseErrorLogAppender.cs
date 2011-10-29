using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using log4net.Appender;
using System.Data;
using System.Data.SqlClient;
using log4net.Layout;

namespace TMD.Infrastructure.Logging
{
    public class DatabaseErrorLogAppender : AdoNetAppender
    {
        public DatabaseErrorLogAppender()
        {
            ConnectionType = typeof(SqlConnection).AssemblyQualifiedName;
            ConnectionString = Registry.ConnectionString;
            BufferSize = 1;
            CommandText = 
                @"insert into Logging.Errors (Timestamp, ApplicationMachine, ApplicationPath, RequestUrl, RequestUserHostAddress, RequestUrlReferrer, RequestIsAuthenticated, RequestUser, Class, Message, StackTrace)
                values (@timestamp, @applicationMachine, @applicationPath, @requestUrl, @requestUserHostAddress, @requestUrlReferrer, @requestIsAuthenticated, @requestUser, @class, @message, @stackTrace)";
            AddParameter(new AdoNetAppenderParameter
                {
                    ParameterName = "@timestamp",
                    DbType = DbType.DateTime,
                    Layout = new RawTimeStampLayout()
                });
            AddParameter(new AdoNetAppenderParameter
                {
                    ParameterName = "@applicationMachine",
                    DbType = DbType.AnsiString,
                    Size = 300,
                    Layout = new RawPropertyLayout { Key = "Application.Machine" }
                });
            AddParameter(new AdoNetAppenderParameter
                {
                    ParameterName = "@applicationPath",
                    DbType = DbType.AnsiString,
                    Size = 300,
                    Layout = new RawPropertyLayout { Key = "Application.Path" }
                }); 
            AddParameter(new AdoNetAppenderParameter
                {
                    ParameterName = "@requestUrl",
                    DbType = DbType.AnsiString,
                    Size = 1000,
                    Layout = new RawPropertyLayout { Key = "Request.Url" }
                });
            AddParameter(new AdoNetAppenderParameter
                {
                    ParameterName = "@requestUserHostAddress",
                    DbType = DbType.AnsiString,
                    Size = 50,
                    Layout = new RawPropertyLayout { Key = "Request.UserHostAddress" }
                });
            AddParameter(new AdoNetAppenderParameter
                {
                    ParameterName = "@requestUrlReferrer",
                    DbType = DbType.AnsiString,
                    Size = 1000,
                    Layout = new RawPropertyLayout { Key = "Request.UrlReferrer" }
                });
            AddParameter(new AdoNetAppenderParameter
                {
                    ParameterName = "@requestIsAuthenticated",
                    DbType = DbType.Boolean,
                    Layout = new RawPropertyLayout { Key = "Request.IsAuthenticated" }
                });
            AddParameter(new AdoNetAppenderParameter
                {
                    ParameterName = "@requestUser",
                    DbType = DbType.AnsiString,
                    Size = 100,
                    Layout = new RawPropertyLayout { Key = "Request.User" }
                });
            AddParameter(new AdoNetAppenderParameter
                {
                    ParameterName = "@class",
                    DbType = DbType.AnsiString,
                    Size = 1000,
                    Layout = new Layout2RawLayoutAdapter(new PatternLayout("%c"))
                });
            AddParameter(new AdoNetAppenderParameter
                {
                    ParameterName = "@message",
                    DbType = DbType.AnsiString,
                    Size = 8000,
                    Layout = new Layout2RawLayoutAdapter(new PatternLayout("%m"))
                });
            AddParameter(new AdoNetAppenderParameter
                {
                    ParameterName = "@stackTrace",
                    DbType = DbType.AnsiString,
                    Size = 8000,
                    Layout = new Layout2RawLayoutAdapter(new ExceptionLayout())
                });
        }

        protected override void SendBuffer(IDbTransaction dbTran, log4net.Core.LoggingEvent[] events)
        {
            base.SendBuffer(dbTran, events);
        }

        protected override void SendBuffer(log4net.Core.LoggingEvent[] events)
        {
            base.SendBuffer(events);
        }
    }
}
