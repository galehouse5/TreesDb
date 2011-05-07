using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.Text.RegularExpressions;
using System.Text;
using System.Diagnostics;

namespace TMD.Mappings.ValidationMapping
{
    public interface IMessageMapper
    {
        string Map(string message);
    }

    [DebuggerDisplay("source message")]
    public class SourceMessageMapper : IMessageMapper
    {
        public string Map(string message)
        {
            return message;
        }
    }

    [DebuggerDisplay("{Message}")]
    public class ConstantMessageMapper : IMessageMapper
    {
        public ConstantMessageMapper(string message)
        {
            this.Message = message;
        }

        public string Message { get; private set; }

        public string Map(string message)
        {
            return this.Message;
        }
    }
}