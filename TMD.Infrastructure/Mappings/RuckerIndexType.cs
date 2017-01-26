using NHibernate;
using NHibernate.SqlTypes;
using NHibernate.UserTypes;
using System;
using System.Data;
using TMD.Model;

namespace TMD.Infrastructure.Mappings
{
    public class RuckerIndexType : IUserType
    {
        public bool IsMutable => false;
        public Type ReturnedType => typeof(RuckerIndex);
        public SqlType[] SqlTypes { get; } = new[] { new SqlType(DbType.Single) };

        // Unsure how to implement this method...
        public object Assemble(object cached, object owner)
            => cached;

        // Unsure how to implement this method...
        public object DeepCopy(object value)
            => value;

        // Unsure how to implement this method...
        public object Disassemble(object value)
            => value;

        public new bool Equals(object x, object y)
            => object.Equals(x, y);

        public int GetHashCode(object x)
            => x?.GetHashCode() ?? 0;

        public object NullSafeGet(IDataReader rs, string[] names, object owner)
        {
            object value = NHibernateUtil.Single.NullSafeGet(rs, names);
            if (value == null) return null;

            return (RuckerIndex)(float)value;
        }

        public void NullSafeSet(IDbCommand cmd, object value, int index)
        {
            IDataParameter param = (IDataParameter)cmd.Parameters[index];
            param.Value = value == null ? DBNull.Value : (object)(float)value;
        }

        // Unsure how to implement this method...
        public object Replace(object original, object target, object owner)
            => original;
    }
}
