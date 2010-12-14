﻿using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Drawing;
using System.IO;
using System.Drawing.Imaging;
using System.Diagnostics;

namespace TMD.Model.Photos
{
    public class StoredPhotoInfo
    {
        internal StoredPhotoInfo() { }
        public Photo Photo { get; internal set; }
        public Size Size { get; internal set; }
        public int Bytes { get; internal set; }
        public PhotoFormat Format { get; internal set; }
    }

    public abstract class PhotoStoreBase : IEntity
    {
        public virtual int Id { get; private set; }
        public virtual bool IsActive { get; private set; }

        public virtual StoredPhotoInfo Store(Photo photo, Bitmap image)
        {
            using (Stream s = GetWriteStream(photo))
            {
                image.Save(s,
                    image.RawFormat.Equals(ImageFormat.Jpeg) ? ImageFormat.Jpeg
                    : image.RawFormat.Equals(ImageFormat.Gif) ? ImageFormat.Gif
                    : ImageFormat.Png);
                return new StoredPhotoInfo 
                { 
                    Photo = photo, 
                    Size = image.Size, 
                    Bytes = (int)s.Length,
                    Format = image.RawFormat.Equals(ImageFormat.Jpeg) ? PhotoFormat.Jpeg
                        : image.RawFormat.Equals(ImageFormat.Gif) ? PhotoFormat.Gif
                        : PhotoFormat.Png
                };
            }
        }

        public abstract Stream GetWriteStream(Photo photo);

        public virtual Bitmap Retrieve(Photo photo)
        {
            using (Stream s = GetReadStream(photo))
            {
                return new Bitmap(s);
            }
        }

        public abstract Stream GetReadStream(Photo photo);

        public abstract void Remove(Photo photo);

        public virtual void MigrateTo(PhotoStoreBase store, Photo photo)
        {
            using (Stream read = GetReadStream(photo))
            {
                using (Stream write = store.GetWriteStream(photo))
                {
                    byte[] buffer = new byte[16384];
                    for (int count = read.Read(buffer, 0, buffer.Length); count > 0; count = read.Read(buffer, 0, buffer.Length))
                    {
                        write.Write(buffer, 0, count);
                    }
                }
                Remove(photo);
            }
        }
    }

    [DebuggerDisplay("Memory")]
    public class MemoryPhotoStore : PhotoStoreBase
    {
        private byte[] m_PhotoBytes;
        protected MemoryPhotoStore()
        { }

        private class MemoryPhotoStream : MemoryStream
        {
            private MemoryPhotoStore m_Store;
            public MemoryPhotoStream(MemoryPhotoStore store)
            {
                m_Store = store;
            }

            protected override void Dispose(bool disposing)
            {
                m_Store.m_PhotoBytes = new byte[(int)Length];
                Position = 0;
                this.Read(m_Store.m_PhotoBytes, 0, (int)Length);
                base.Dispose(disposing);
            }
        }

        public override Stream GetWriteStream(Photo photo)
        {
            return new MemoryPhotoStream(this);
        }

        public override Stream GetReadStream(Photo photo)
        {
            return new MemoryStream(m_PhotoBytes);
        }

        public override void Remove(Photo photo)
        {
            m_PhotoBytes = null;
        }

        internal static MemoryPhotoStore Create()
        {
            return new MemoryPhotoStore();
        }
    }

    [DebuggerDisplay("{RootPath}")]
    public class DiskPhotoStore : PhotoStoreBase
    {
        protected DiskPhotoStore()
        { }

        public virtual string RootPath { get; private set; }

        private string getPath(Photo photo)
        {
            return string.Format("{0}\\{1}", RootPath.TrimEnd('\\'), photo.Id);
        }

        public override Stream GetWriteStream(Photo photo)
        {
            return new FileStream(getPath(photo), FileMode.OpenOrCreate, FileAccess.Write);
        }

        public override Stream GetReadStream(Photo photo)
        {
            return new FileStream(getPath(photo), FileMode.Open, FileAccess.Read);
        }

        public override void Remove(Photo photo)
        {
            if (File.Exists(getPath(photo)))
            {
                File.Delete(getPath(photo));
            }
        }
    }
}