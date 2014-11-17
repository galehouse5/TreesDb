using System.IO;

namespace TMD.Model.Extensions
{
    public class TemporaryFileStream : FileStream
    {
        public TemporaryFileStream()
            : base(Path.GetTempFileName(), FileMode.Create)
        { }

        protected override void Dispose(bool disposing)
        {
            base.Dispose(disposing);

            if (disposing)
            {
                if (File.Exists(Name))
                {
                    File.Delete(Name);
                }
            }
        }
    }
}
