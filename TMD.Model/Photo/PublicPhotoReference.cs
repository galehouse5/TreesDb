using System.Collections.Generic;
using TMD.Model.Users;

namespace TMD.Model.Photo
{
    public class PublicPhotoReference : PhotoReference
    {
        public override string Caption
        {
            get { return string.Empty; }
        }

        public override IEnumerable<string> Photographers
        {
            get { yield break; }
        }

        public override bool CanView(User user)
        {
            return true;
        }
    }
}
