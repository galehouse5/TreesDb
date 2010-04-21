function InitializeTripFormValidation() {
    $('#tripForm').validate({
        rules: {
            Name: { TMDAlways: true, maxlength: 100 },
            Date: { TMDAlways: true, TMDDate: true },
            Website: { TMDAlways: true, maxlength: 100 },
            MeasurerContactInfo: { TMDAlways: true, required: true, maxlength: 200 },
            PhotosAvailable: { TMDAlways: true }
        }
    });
}

$(document).ready(function () {
    CreateDatepicker($("#Date"));
    InitializeTripFormValidation();
    $('#Name').focus();
    $('.wizard a').click(function () {
        if (!$(this).hasClass('advance') || $('#tripForm').valid()) {
            var link = $(this);
            $.post('/Import/TripInfo',
                    $('#tripForm').serialize(),
                    function () {
                        window.location.href = link.attr("href")
                    }
                );
            return false;
        } else {
            return false;
        }
    });
});