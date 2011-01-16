using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Drawing;
using System.Drawing.Imaging;
using TMD.Model.Users;

namespace TMD.Model.Photos
{
    public abstract class PhotoReferenceBase : IEntity, IPhoto
    {
        protected PhotoReferenceBase()
        { }

        public virtual int Id { get; private set; }
        public virtual Photo Photo { get; protected internal set; }
        public virtual int GlobalId { get { return Photo.Id; } }
        public virtual Size Size { get { return Photo.Size; } }
        public virtual int Bytes { get { return Photo.Bytes; } }
        public virtual PhotoFormat Format { get { return Photo.Format; } }
        public virtual string ContentType { get { return Photo.ContentType; } }
        public virtual ImageFormat ImageFormat { get { return Photo.ImageFormat; } }
        public virtual Bitmap Get() { return Photo.Get(); }
        public virtual Bitmap Get(EPhotoSize size) { return Photo.Get(size); }

        public virtual bool IsAuthorizedToView(User user) { return false; }
        public virtual bool IsAuthorizedToAdd(User user) { return false; }
        public virtual bool IsAuthorizedToRemove(User user) { return false; }

        public virtual void AddReference(PhotoReferenceBase reference) { Photo.AddReference(reference); }
        public virtual bool RemoveReference(PhotoReferenceBase reference) { return Photo.RemoveReference(reference); }
        public virtual int ReferenceCount { get { return Photo.ReferenceCount; } }

        public static implicit operator Photo(PhotoReferenceBase reference) { return reference.Photo; }
    }

    public class PublicPhotoReference : PhotoReferenceBase
    {
        public PublicPhotoReference()
        { }
    }
}
