using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;

namespace TMD.Model
{
    public interface IIsConflicting
    {
        bool IsConflicting { get; }
        IList<string> GetConflicts();
    }
}
