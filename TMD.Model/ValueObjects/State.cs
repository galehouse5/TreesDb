using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using TMD.Common;

namespace TMD.Model
{
    public class State : ICloneable
    {
        private string m_Code;
        private string m_Name;
        private bool m_LoadOnPropertySet;

        private State()
        {
            m_LoadOnPropertySet = true;
        }

        private State(string code, string name, CoordinateBounds coordinateBounds)
        {
            m_LoadOnPropertySet = false;
            this.Code = code;
            this.Name = name;
        }

        public string Code
        {
            get { return m_Code; }
            private set
            {
                m_Code = value.Trim().ToUpper();
                if (m_LoadOnPropertySet)
                {
                    m_LoadOnPropertySet = false;
                    foreach (State s in States)
                    {
                        if (s.Code == m_Code)
                        {
                            Name = s.Name;
                            CoordinateBounds = (CoordinateBounds)s.CoordinateBounds.Clone();
                            return;
                        }
                    }
                    m_LoadOnPropertySet = true;
                    throw new ApplicationException(string.Format("Unknown state '{0}'.", value));
                }

            }
        }

        public string Name
        {
            get { return m_Name; }
            private set
            {
                m_Name = value.Trim().ToTitleCase();
                if (m_LoadOnPropertySet)
                {
                    m_LoadOnPropertySet = false;
                    foreach (State s in States)
                    {
                        if (s.Name == m_Name)
                        {
                            Code = s.Code;
                            CoordinateBounds = (CoordinateBounds)s.CoordinateBounds.Clone();
                            return;
                        }
                    }
                    m_LoadOnPropertySet = true;
                    throw new ApplicationException(string.Format("Unknown state '{0}'.", value));
                }

            }
        }

        public CoordinateBounds CoordinateBounds { get; private set; }

        public static bool operator ==(State s1, State s2)
        {
            return s1.Code == s2.Code;
        }

        public static bool operator !=(State s1, State s2)
        {
            return s1.Code != s2.Code;
        }

        public override bool Equals(object obj)
        {
            State s = obj as State;
            return s.Code == this.Code;
        }

        public override int GetHashCode()
        {
            return Code.GetHashCode();
        }

        private static List<State> s_States;
        private static List<State> States
        {
            get
            {
                if (s_States == null)
                {
                    s_States = new List<State>();
                    foreach (StateElement se in ModelRegistry.ModelSettings.States)
                    {
                        State s = new State(se.Code.Trim().ToUpper(),
                            se.Name.Trim().ToTitleCase(),
                            CoordinateBounds.Create(Coordinates.Create(se.NECoordinates),
                            Coordinates.Create(se.SWCoordinates)));
                        s_States.Add(s);
                    }
                }
                return s_States;
            }
        }

        public static State Create(string s)
        {
            string code = s.Trim().ToUpper();
            string name = s.Trim().ToTitleCase();
            foreach (State state in States)
            {
                if (state.Code == code || state.Name == name)
                {
                    return (State)state.Clone();
                }
            }
            throw new ApplicationException(string.Format("Unknown state '{0}'.", s));
        }

        #region ICloneable Members

        public object Clone()
        {
            return new State(Code, Name, (CoordinateBounds)CoordinateBounds.Clone());
        }

        #endregion
    }
}
