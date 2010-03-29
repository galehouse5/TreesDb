using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;

namespace TMD.Model.Trees
{
    interface ITreeRepository
    {
        Tree FindBy(Guid id);
        void Update(Tree tree);
    }
}
