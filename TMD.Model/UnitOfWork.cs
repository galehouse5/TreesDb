using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;

namespace TMD.Model
{
    public interface IUnitOfWork
    {
        void PersistAll();
        void Clean();
    }

    public static class UnitOfWork
    {
        public static void PersistAll()
        {
            ModelRegistry.UnitOfWork.PersistAll();
        }

        public static void Clean()
        {
            ModelRegistry.UnitOfWork.Clean();
        }
    }
}
