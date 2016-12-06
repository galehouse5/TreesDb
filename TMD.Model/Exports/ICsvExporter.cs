using System.Collections.Generic;

namespace TMD.Model.Exports
{
    public interface ICsvExporter<TEntity>
        where TEntity : IEntity
    {
        string Filename { get; }
        IEnumerable<string> Headers { get; }
        IEnumerable<string> GetRow(TEntity entity);
    }

    public static class ICsvExporterExtensions
    {
        public static IEnumerable<IEnumerable<string>> Export<TEntity>(this ICsvExporter<TEntity> exporter, IEnumerable<TEntity> entities)
            where TEntity : IEntity
        {
            yield return exporter.Headers;

            foreach (TEntity entity in entities)
                yield return exporter.GetRow(entity);
        }
    }
}
