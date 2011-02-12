String.prototype.Trim = function () {
    return this.replace(/^\s*/, '').replace(/\s*$/, '');
};

String.prototype.IsNullOrWhitespace = function () {
    return this == null || this.Trim() == '';
};

String.prototype.Contains = function (substring) {
    return this.indexOf(substring) > -1;
};

Number.prototype.RoundToDecimals = function (decimals) {
    return Math.round(this * Math.pow(10, decimals)) / Math.pow(10, decimals);
};
