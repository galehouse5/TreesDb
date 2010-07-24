using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;

namespace TMD.Model.Trees
{
    [Serializable]
    public class KnownTree : IEntity
    {
        protected KnownTree()
        {}

        public virtual int Id { get; private set; }

        private string m_AcceptedSymbol;
        public virtual string AcceptedSymbol 
        {
            get { return m_AcceptedSymbol; }
            private set { m_AcceptedSymbol = (value ?? string.Empty).Trim().ToUpper(); } 
        }

        private string m_ScientificName;
        public virtual string ScientificName 
        {
            get { return m_ScientificName; }
            private set { m_ScientificName = (value ?? string.Empty).Trim(); }
        }

        private string m_CommonName;
        public virtual string CommonName 
        {
            get { return m_CommonName; }
            private set { m_CommonName = (value ?? string.Empty).Trim().ToTitleCase(); }
        }

        internal static KnownTree Create(string acceptedSymbol, string scientificName, string commonName)
        {
            return new KnownTree()
            {
                AcceptedSymbol = acceptedSymbol,
                ScientificName = scientificName,
                CommonName = commonName
            };
        }
    }
}
