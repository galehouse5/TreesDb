using Microsoft.WindowsAzure.Storage;
using Microsoft.WindowsAzure.Storage.Blob;
using System;
using System.Collections.Generic;
using System.IO;
using TMD.Model.Photos;

namespace Tmd.WindowsAzure
{
    public class BlobStoragePhotoStoreProvider : IPhotoStoreProvider
    {
        private string connectionString;

        public BlobStoragePhotoStoreProvider(string connectionString)
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

        public bool Contains(Photo photo)
        {
            CloudBlobContainer container = getContainer();

            return container.GetBlockBlobReference(photo.Id.ToString()).Exists();
        }

        public Stream GetWriteStream(Photo photo)
        {
            CloudBlobContainer container = getContainer();

            return container.GetBlockBlobReference(photo.Id.ToString()).OpenWrite();
        }

        public Stream GetReadStream(Photo photo)
        {
            CloudBlobContainer container = getContainer();

            CloudBlockBlob blob = container.GetBlockBlobReference(photo.Id.ToString());
            if (!blob.Exists()) return null;

            return container.GetBlockBlobReference(photo.Id.ToString()).OpenRead();
        }

        public void Remove(Photo photo)
        {
            CloudBlobContainer container = getContainer();

            container.GetBlockBlobReference(photo.Id.ToString()).DeleteIfExists();
        }

        public int RemoveOrphans(IEnumerable<IPhoto> allParantedPhotos)
        {
            throw new NotImplementedException();
        }
    }
}
