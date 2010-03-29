using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;

namespace TMD.Model
{
    public abstract class UnitOfWorkProvider
    {
        public IUnitOfWork UnitOfWork
        {
            get
            {
                if (unitOfWork == null)
                {
                    Type unitOfWorkImplementationType = Type.GetType(ModelRegistry.ModelSettings.UnitOfWorkImplementation);
                    unitOfWork = (IUnitOfWork)Activator.CreateInstance(unitOfWorkImplementationType);
                }
                return unitOfWork;
            }
        }

        protected abstract IUnitOfWork unitOfWork { get; set; }
    }
}
