using log4net.Appender;
using log4net.Core;
using log4net.Layout;
using System.Diagnostics;

namespace TMD.Infrastructure
{
    public class DebugAppender : AppenderSkeleton
    {
        public DebugAppender()
        {
            ImmediateFlush = true;
            Category = new PatternLayout("%logger");
        }

        public bool ImmediateFlush { get; set; }
        public PatternLayout Category { get; set; }
        protected override bool RequiresLayout { get { return true; } }

        protected override void Append(LoggingEvent loggingEvent)
        {
            Debug.Write(RenderLoggingEvent(loggingEvent), Category.Format(loggingEvent));

            if (ImmediateFlush)
            {
                Debug.Flush();
            }
        }
    }
}
