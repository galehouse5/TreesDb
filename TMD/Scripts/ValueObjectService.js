var ValueObjectService = new function () {

    this.CreateCoordinates = function (latitude, longitude) {
        var coordinates;
        $.ajax({
            async: false,
            data: { latitude: latitude, longitude: longitude },
            url: '/ValueObjects/CreateCoordinates',
            success: function (data) { coordinates = data; }
        });
        return coordinates;
    }

    this.CreateCoordinatesWithFormat = function (latitude, longitude, format) {
        var coordinates;
        $.ajax({
            async: false,
            data: { latitude: latitude, longitude: longitude, format: format },
            url: '/ValueObjects/CreateCoordinatesWithFormat',
            success: function (data) { coordinates = data; }
        });
        return coordinates;
    }
};