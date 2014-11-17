using Microsoft.WindowsAzure.Storage;
using Microsoft.WindowsAzure.Storage.Blob;
using System.IO;
using TMD.Model.Photo.FileStore;

namespace Tmd.WindowsAzure
{
    public class BlobStoragePhotoFileStore : IPhotoFileStore
    {
        private string connectionString;

        public BlobStoragePhotoFileStore(string connectionString)
        {
            this.connectionString = connectionString;
            ContainerName = "photo-store";
        }

        public string ContainerName { get; private set; }

        private CloudBlobContainer getContainer()
        {
            CloudBlobClient client = CloudStorageAccount.Parse(connectionString).CreateCloudBlobClient();
            return client.GetContainerReference(ContainerName);
        }

        public void Initialize()
        {
            CloudBlobContainer container = getContainer();

            container.CreateIfNotExists();
        }

        public Stream ReadPhotoFile(int photoId)
        {
            CloudBlobContainer container = getContainer();

            CloudBlockBlob blob = container.GetBlockBlobReference(photoId.ToString());
            if (!blob.Exists()) return null;

            return container.GetBlockBlobReference(photoId.ToString()).OpenRead();
        }

        public Stream WritePhotoFile(int photoId)
        {
            CloudBlobContainer container = getContainer();

            return container.GetBlockBlobReference(photoId.ToString()).OpenWrite();
        }

        public void DeletePhotoFile(int photoId)
        {
            CloudBlobContainer container = getContainer();

            container.GetBlockBlobReference(photoId.ToString()).DeleteIfExists();
        }
    }
}
