using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using TMD.Common;
using TMD.Model.Validation;

namespace TMD.Model
{
    public class State : ICloneable, IIsValid, IIsNull
    {
        private string m_Code;
        private bool m_IsKnown;

        private State()
        {
            m_IsKnown = false;
        }

        private State(string code, string name, CoordinateBounds coordinateBounds, bool isKnown)
        {
            m_Code = code;
            this.Name = name;
            this.CoordinateBounds = (CoordinateBounds)coordinateBounds.Clone();
            m_IsKnown = isKnown;
        }

        public string Code
        {
            get { return m_Code; }
            private set
            {
                m_Code = value.Trim().ToUpper();
                foreach (State s in KnownStates)
                {
                    if (s.Code == m_Code)
                    {
                        this.Name = s.Name;
                        this.CoordinateBounds = (CoordinateBounds)s.CoordinateBounds.Clone();
                        m_IsKnown = true;
                    }
                }
            }
        }

        public string Name { get; private set; }
        public CoordinateBounds CoordinateBounds { get; private set; }

        public static bool operator ==(State s1, State s2)
        {
            if ((object)s1 == null || (object)s2 == null)
            {
                return (object)s1 == null && (object)s2 == null;
            }
            return s1.Code == s2.Code;
        }

        public static bool operator !=(State s1, State s2)
        {
            if ((object)s1 == null || (object)s2 == null)
            {
                return !((object)s1 == null && (object)s2 == null);
            }
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

        private static List<State> s_KnownStates;
        public static IList<State> KnownStates
        {
            get
            {
                if (s_KnownStates == null)
                {
                    s_KnownStates = new List<State>();
                    foreach (StateElement se in ModelRegistry.ModelSettings.States)
                    {
                        State s = new State(se.Code.Trim().ToUpper(),
                            se.Name.Trim().ToTitleCase(),
                            CoordinateBounds.Create(Coordinates.Create(se.NECoordinates), Coordinates.Create(se.SWCoordinates)),
                            true);
                        s_KnownStates.Add(s);
                    }
                }
                return s_KnownStates.AsReadOnly();
            }
        }

        public static State Create(string code)
        {
            code = code.Trim().ToUpper();
            foreach (State s in KnownStates)
            {
                if (s.Code == code)
                {
                    return (State)s.Clone();
                }
            }
            return new State(code, string.Empty, CoordinateBounds.Null(), false);
        }

        public static State Null()
        {
            return new State(string.Empty, string.Empty, CoordinateBounds.Null(), true);
        }

        #region ICloneable Members

        public object Clone()
        {
            return new State(Code, Name, (CoordinateBounds)CoordinateBounds.Clone(), m_IsKnown);
        }

        #endregion

        #region IIsValid Members

        public bool IsValid
        {
            get { return m_IsKnown; }
        }

        public IList<string> GetValidationErrors()
        {
            List<string> errors = new List<string>();
            if (!m_IsKnown)
            {
                errors.Add(string.Format("Unknown country code '{0}'.", Code));
            }
            return errors;
        }

        #endregion

        #region IIsNull Members

        public bool IsNull
        {
            get { return string.IsNullOrWhiteSpace(Code); }
        }

        #endregion
    }
}
