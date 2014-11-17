using System.Linq;
using TMD.Model.Users;

namespace TMD.Model.Photo
{
    public class PhotoRepository : RepositoryDecorator<PhotoFile>
    {
        private IRepository<PhotoReference> referenceRepository;

        public PhotoRepository(IRepository<PhotoFile> fileRepository, IRepository<PhotoReference> referenceRepository)
            : base(fileRepository)
        {
            this.referenceRepository = referenceRepository;
        }

        public IQueryable<PhotoFile> GetFiles(User creator)
        {
            return Next.Where(f => f.Creator.Id == creator.Id);
        }

        public IQueryable<PhotoFile> GetOrphanedFiles(User creator)
        {
            var references = referenceRepository.Select(r => r);

            return GetFiles(creator)
                .Where(f => !references.Any(r => r.File.Id == f.Id));
        }
    }
}
