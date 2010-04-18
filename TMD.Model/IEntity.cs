using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;

namespace TMD.Model
{
    public interface IEntity 
    {
        Guid Id { get; }
        Date Created { get; }
    }
}
