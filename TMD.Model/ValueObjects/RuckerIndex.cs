namespace TMD.Model
{
    public struct RuckerIndex
    {
        public float FeetBasedValue { get; set; }

        public float YardsBasedValue
        {
            get { return FeetBasedValue / 3f; }
            set { FeetBasedValue = value * 3f; }
        }

        public float MetersBasedValue
        {
            get { return FeetBasedValue / 3.2808399f; }
            set { FeetBasedValue = value * 3.2808399f; }
        }

        public string ToString(Units units)
            => units == Units.Meters ? $"{MetersBasedValue:0.000}"
            : units == Units.Yards ? $"{YardsBasedValue:0.000}"
            : $"{FeetBasedValue:0.00}";

        public override string ToString()
            => ToString(Units.Default);

        public static implicit operator RuckerIndex(float feetBasedValue)
            => new RuckerIndex { FeetBasedValue = feetBasedValue };

        public static implicit operator float(RuckerIndex index)
            => index.FeetBasedValue;
    }
}
