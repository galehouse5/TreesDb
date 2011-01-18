using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Drawing;
using System.Drawing.Imaging;
using TMD.Model.Users;

namespace TMD.Model.Photos
{
    public static class PhotoReferenceBaseExtensions
    {
        public static bool IsAuthorizedToView(this IEnumerable<PhotoReferenceBase> references, User user)
        {
            return (from reference in references select reference.IsAuthorizedToView(user)).Count() > 0;
        }

        public static bool IsAuthorizedToAdd(this IEnumerable<PhotoReferenceBase> references, User user)
        {
            return (from reference in references select reference.IsAuthorizedToAdd(user)).Count() > 0;
        }

        public static bool IsAuthorizedToRemove(this IEnumerable<PhotoReferenceBase> references, User user)
        {
            return (from reference in references select reference.IsAuthorizedToRemove(user)).Count() > 0;
        }
    }

    public abstract class PhotoReferenceBase : IEntity, IPhoto
    {
        protected PhotoReferenceBase() 
        { }

        protected PhotoReferenceBase(Photo photo)
        {
            this.Photo = photo;
        }

        public virtual int Id { get; private set; }
        public virtual Photo Photo { get; protected set; }
        public virtual int PhotoId { get { return Photo.Id; } }
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

        public static implicit operator Photo(PhotoReferenceBase reference) { return reference.Photo; }
    }

    public class PublicPhotoReference : PhotoReferenceBase
    {
        protected PublicPhotoReference() { }
        public PublicPhotoReference(Photo photo) : base(photo) { }
    }
}
