var LocationsService = new function () {
    var public = this;

    var m_AllCountries;
    public.FindAllCountries = function () {
        if (m_AllCountries == null) {
            $.ajax({
                async: false,
                url: '/Locations/FindAllCountries',
                success: function (data) { m_AllCountries = data; }
            });
        }
        return m_AllCountries;
    };

    var m_AllStates = new Object();
    public.FindStatesByCountryCode = function (code) {
        if (m_AllStates[code] == null) {
            $.ajax({
                async: false,
                url: '/Locations/FindStatesByCountryCode',
                data: { code: code },
                success: function (data) { m_AllStates[code] = data; }
            });
        }
        return m_AllStates[code];
    };
};