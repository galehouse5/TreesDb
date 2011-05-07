using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Drawing;
using System.Drawing.Imaging;
using TMD.Model.Users;
using NHibernate.Validator.Constraints;

namespace TMD.Model.Photos
{
    public interface IPhotoPermissions
    {
        bool IsAuthorizedToView(User user);
        bool IsAuthorizedToAdd(User user);
        bool IsAuthorizedToRemove(User user);
    }

    public abstract class PhotoReferenceBase : IEntity, IPhoto, IPhotoPermissions
    {
        protected PhotoReferenceBase() 
        { }

        protected PhotoReferenceBase(Photo photo)
        {
            this.Photo = photo;
        }

        public virtual bool IsAuthorizedToView(User user) { return false; }
        public virtual bool IsAuthorizedToAdd(User user) { return false; }
        public virtual bool IsAuthorizedToRemove(User user) { return false; }

        public virtual int Id { get; private set; }
        [Valid] public virtual Photo Photo { get; protected set; }
        public virtual int StaticId { get { return Photo.Id; } }
        public virtual Size Size { get { return Photo.Size; } }
        public virtual int Bytes { get { return Photo.Bytes; } }
        public virtual PhotoFormat Format { get { return Photo.Format; } }
        public virtual string ContentType { get { return Photo.ContentType; } }
        public virtual ImageFormat ImageFormat { get { return Photo.ImageFormat; } }
        public virtual Bitmap Get() { return Photo.Get(); }
        public virtual Bitmap Get(PhotoSize size) { return Photo.Get(size); }
        public abstract IList<Name> Photographers { get; }
        public virtual string Caption { get; set; }
        public virtual int CaptionId { get { return Id; } }
        public virtual bool HasCaption { get { return true; } }

        public virtual bool EqualsPhoto(IPhoto photo)
        {
            if (photo is PhotoReferenceBase)
            {
                return Photo.EqualsPhoto((photo as PhotoReferenceBase).Photo);
            }
            return Photo.EqualsPhoto(photo);
        }

        public virtual Photo ToPhoto()
        {
            return Photo;
        }
    }

    public class PublicPhotoReference : PhotoReferenceBase
    {
        protected PublicPhotoReference() { }
        public PublicPhotoReference(Photo photo) : base(photo) { }

        public override IList<Name> Photographers
        {
            get { return new List<Name>(); }
        }
    }

    public class PhotoReferences : List<PhotoReferenceBase>, IPhotoPermissions
    {
        public bool IsAuthorizedToView(User user)
        {
            return (from reference in this
                    select reference.IsAuthorizedToView(user)).Count() > 0;
        }

        public bool IsAuthorizedToAdd(User user)
        {
            return (from reference in this
                    select reference.IsAuthorizedToAdd(user)).Count() > 0;
        }

        public bool IsAuthorizedToRemove(User user)
        {
            return (from reference in this
                    select reference.IsAuthorizedToRemove(user)).Count() > 0;
        }
    }

}
