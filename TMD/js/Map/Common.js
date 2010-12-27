String.prototype.Trim = function () { return this.replace(/^\s*/, '').replace(/\s*$/, ''); }
String.prototype.IsNullOrWhitespace = function () { return this == null || this.Trim() == ''; }
String.prototype.Contains = function (substring) { return this.indexOf(substring) > -1; }
Number.prototype.RoundToDecimals = function (decimals) { return Math.round(this * Math.pow(10, decimals)) / Math.pow(10, decimals); }

var CoordinatesFormat = {
    Invalid: 0,
    Unspecified: 1,
    Default: 2,
    DegreesMinutesDecimalSeconds: 3,
    DegreesDecimalMinutes: 4,
    DecimalDegrees: 5
};

var Coordinates = {
    Create: function (latitude, longitude) {
        return {
            Latitude: function () { return latitude; },
            Longitude: function () { return longitude; },
            InputFormat: function () {
                if (this.Latitude().InputFormat() == CoordinatesFormat.Invalid
                            || this.Longitude().InputFormat() == CoordinatesFormat.Invalid) {
                    return CoordinatesFormat.Invalid;
                }
                if (this.Latitude().InputFormat() == CoordinatesFormat.Unspecified
                            || this.Longitude().InputFormat() == CoordinatesFormat.Unspecified) {
                    return CoordinatesFormat.Unspecified;
                }
                return this.Latitude().InputFormat();
            },
            IsValid: function () { return this.InputFormat() != CoordinatesFormat.Invalid; },
            IsSpecified: function () { return this.InputFormat() != CoordinatesFormat.Unspecified; },
            ToString: function (format) {
                if (!this.Latitude().IsSpecified() || !this.Latitude().IsValid()
                        || !this.Longitude().IsSpecified() || !this.Longitude().IsValid()) {
                    return '';
                }
                return this.Latitude().ToString(format || this.InputFormat())
                            + ', ' + this.Longitude().ToString(format || this.InputFormat());
            }
        }
    },
    Parse: function (coordinates) {
        if (coordinates.IsNullOrWhitespace()
                    || !coordinates.Contains(',')) {
            return this.Null();
        }
        var parts = coordinates.split(',', 2);
        return this.Create(
                    Latitude.Parse(parts[0]),
                    Longitude.Parse(parts[1]));
    },
    Null: function () { return this.Create(Latitude.Null(), Longitude.Null()); }
};

var Longitude = {
    Create: function (degrees, inputFormat) {
        return {
            TotalDegrees: function () { return degrees; },
            Sign: function () { return this.TotalDegrees() >= 0 ? 1 : -1; },
            AbsoluteTotalDegrees: function () { return Math.abs(this.TotalDegrees()); },
            AbsoluteWholeDegrees: function () { return Math.floor(this.AbsoluteTotalDegrees()); },
            AbsoluteMinutes: function () { return 60.0 * (this.AbsoluteTotalDegrees() - this.AbsoluteWholeDegrees()); },
            AbsoluteWholeMinutes: function () { return Math.floor(this.AbsoluteMinutes()); },
            AbsoluteSeconds: function () { return 60 * (this.AbsoluteMinutes() - this.AbsoluteWholeMinutes()); },
            IsSpecified: function () { return this.InputFormat() != CoordinatesFormat.Unspecified; },
            IsValid: function () {
                return this.InputFormat() != CoordinatesFormat.Invalid
                        && this.TotalDegrees() >= -180.0
                        && this.TotalDegrees() <= 180.0;
            },
            InputFormat: function () { return inputFormat; },
            ToString: function (format) {
                switch (format || this.InputFormat()) {
                    case CoordinatesFormat.Unspecified:
                    case CoordinatesFormat.Invalid:
                        return '';
                    case CoordinatesFormat.DegreesMinutesDecimalSeconds:
                        return (this.AbsoluteWholeDegrees() * this.Sign())
                                    + ' ' + this.AbsoluteWholeMinutes()
                                    + ' ' + this.AbsoluteSeconds().toFixed(1);
                    case CoordinatesFormat.DecimalDegrees:
                        return (this.AbsoluteTotalDegrees() * this.Sign()).toFixed(5);
                    case CoordinatesFormat.Default:
                    case CoordinatesFormat.DegreesDecimalMinutes:
                    default:
                        return (this.AbsoluteWholeDegrees() * this.Sign())
                                    + ' ' + this.AbsoluteMinutes().toFixed(3);
                }
            }
        };
    },
    Parse: function (longitude) {
        var DegreesMinutesSecondsFormat = /^\s*([-+])?([0-9]{1,3})\s+([0-9]{1,2})\s+([0-9]{1,2}(?:\.[0-9]+)?)\s*$/;
        var DegreesDecimalMinutesFormat = /^\s*([-+])?([0-9]{1,3})\s+([0-9]{1,2}(?:\.[0-9]+)?)\s*$/;
        var DecimalDegreesFormat = /^\s*([-+])?([0-9]{1,3}(?:\.[0-9]+)?)\s*$/;
        var sign, degrees, minutes, seconds, inputFormat;
        if (longitude.IsNullOrWhitespace()) {
            sign = 1.0; degrees = 0.0; minutes = 0.0; seconds = 0.0; inputFormat = CoordinatesFormat.Unspecified;
        } else if (DegreesMinutesSecondsFormat.test(longitude)) {
            var match = DegreesMinutesSecondsFormat.exec(longitude);
            sign = '-' == match[1] ? -1.0 : 1.0;
            degrees = parseFloat(match[2]);
            minutes = parseFloat(match[3]);
            seconds = parseFloat(match[4]);
            inputFormat = CoordinatesFormat.DegreesMinutesDecimalSeconds;
        } else if (DegreesDecimalMinutesFormat.test(longitude)) {
            var match = DegreesDecimalMinutesFormat.exec(longitude);
            sign = '-' == match[1] ? -1.0 : 1.0;
            degrees = parseFloat(match[2]);
            minutes = parseFloat(match[3]);
            seconds = 0.0;
            inputFormat = CoordinatesFormat.DegreesDecimalMinutes;
        } else if (DecimalDegreesFormat.test(longitude)) {
            var match = DecimalDegreesFormat.exec(longitude);
            sign = '-' == match[1] ? -1.0 : 1.0;
            degrees = parseFloat(match[2]);
            minutes = 0.0;
            seconds = 0.0;
            inputFormat = CoordinatesFormat.DecimalDegrees;
        } else {
            sign = 1.0; degrees = 0.0; minutes = 0.0; seconds = 0.0; inputFormat = CoordinatesFormat.Invalid;
        }
        return this.Create(
                    (sign * (degrees + (minutes / 60.0) + (seconds / 3600.0))).RoundToDecimals(5),
                    inputFormat);
    },
    Null: function () { return this.Create(0.0, CoordinatesFormat.Unspecified); }
};

var Latitude = {
    Create: function (degrees, inputFormat) {
        return {
            TotalDegrees: function () { return degrees; },
            Sign: function () { return this.TotalDegrees() >= 0 ? 1 : -1; },
            AbsoluteTotalDegrees: function () { return Math.abs(this.TotalDegrees()); },
            AbsoluteWholeDegrees: function () { return Math.floor(this.AbsoluteTotalDegrees()); },
            AbsoluteMinutes: function () { return 60.0 * (this.AbsoluteTotalDegrees() - this.AbsoluteWholeDegrees()); },
            AbsoluteWholeMinutes: function () { return Math.floor(this.AbsoluteMinutes()); },
            AbsoluteSeconds: function () { return 60 * (this.AbsoluteMinutes() - this.AbsoluteWholeMinutes()); },
            IsSpecified: function () { return this.InputFormat() != CoordinatesFormat.Unspecified; },
            IsValid: function () {
                return this.InputFormat() != CoordinatesFormat.Invalid
                        && this.TotalDegrees() >= -90.0
                        && this.TotalDegrees() <= 90.0;
            },
            InputFormat: function () { return inputFormat; },
            ToString: function (format) {
                switch (format || this.InputFormat()) {
                    case CoordinatesFormat.Unspecified:
                    case CoordinatesFormat.Invalid:
                        return '';
                    case CoordinatesFormat.DegreesMinutesDecimalSeconds:
                        return (this.AbsoluteWholeDegrees() * this.Sign())
                                    + ' ' + this.AbsoluteMinutes()
                                    + ' ' + this.AbsoluteSeconds().toFixed(1);
                    case CoordinatesFormat.DecimalDegrees:
                        return (this.AbsoluteTotalDegrees() * this.Sign()).toFixed(5);
                    case CoordinatesFormat.Default:
                    case CoordinatesFormat.DegreesDecimalMinutes:
                    default:
                        return (this.AbsoluteWholeDegrees() * this.Sign())
                                    + ' ' + this.AbsoluteMinutes().toFixed(3);
                }
            }
        };
    },
    Parse: function (latitude) {
        var DegreesMinutesSecondsFormat = /^\s*([-+])?([0-9]{1,2})\s+([0-9]{1,2})\s+([0-9]{1,2}(?:\.[0-9]+)?)\s*$/;
        var DegreesDecimalMinutesFormat = /^\s*([-+])?([0-9]{1,2})\s+([0-9]{1,2}(?:\.[0-9]+)?)\s*$/;
        var DecimalDegreesFormat = /^\s*([-+])?([0-9]{1,2}(?:\.[0-9]+)?)\s*$/;
        var sign, degrees, minutes, seconds, inputFormat;
        if (latitude.IsNullOrWhitespace()) {
            sign = 1.0; degrees = 0.0; minutes = 0.0; seconds = 0.0; inputFormat = CoordinatesFormat.Unspecified;
        } else if (DegreesMinutesSecondsFormat.test(latitude)) {
            var match = DegreesMinutesSecondsFormat.exec(latitude);
            sign = '-' == match[1] ? -1.0 : 1.0;
            degrees = parseFloat(match[2]);
            minutes = parseFloat(match[3]);
            seconds = parseFloat(match[4]);
            inputFormat = CoordinatesFormat.DegreesMinutesDecimalSeconds;
        } else if (DegreesDecimalMinutesFormat.test(latitude)) {
            var match = DegreesDecimalMinutesFormat.exec(latitude);
            sign = '-' == match[1] ? -1.0 : 1.0;
            degrees = parseFloat(match[2]);
            minutes = parseFloat(match[3]);
            seconds = 0.0;
            inputFormat = CoordinatesFormat.DegreesDecimalMinutes;
        } else if (DecimalDegreesFormat.test(latitude)) {
            var match = DecimalDegreesFormat.exec(latitude);
            sign = '-' == match[1] ? -1.0 : 1.0;
            degrees = parseFloat(match[2]);
            minutes = 0.0;
            seconds = 0.0;
            inputFormat = CoordinatesFormat.DecimalDegrees;
        } else {
            sign = 1.0; degrees = 0.0; minutes = 0.0; seconds = 0.0; inputFormat = CoordinatesFormat.Invalid;
        }
        return this.Create(
                    (sign * (degrees + (minutes / 60.0) + (seconds / 3600.0))).RoundToDecimals(5),
                    inputFormat);
    },
    Null: function () { return this.Create(0.0, CoordinatesFormat.Unspecified); }
};
