$.validator.setDefaults({
    validClass: "valid",
    errorClass: "invalid",
    success: "valid"
});

$.validator.addMethod(
    "TMDAlways",
    function (value, element) {
        return true;
    },
    ""
);

    $.validator.addMethod(
	"TMDDate",
	function (value, element) {
	    if (value == '') {
	        return true;
	    }
	    var re = /^\d{1,2}\/\d{1,2}\/\d{4}$/;
	    if (re.test(value)) {
	        var dateParts = value.split('/');
	        var mm = parseInt(dateParts[0], 10);
	        var dd = parseInt(dateParts[1], 10);
	        var yyyy = parseInt(dateParts[2], 10);
	        var date = new Date(yyyy, mm - 1, dd);
	        if (date.getFullYear() == yyyy
                && date.getMonth() == mm - 1
                && date.getDate() == dd) {
	            if (yyyy > 1752 && yyyy < 9999) {
	                return true;
	            }
	            if (yyyy == 9999 && mm == 1 && dd == 1) {
	                return true;
	            }
	        }
	    }
	    return false;
	},
	"Please enter a valid date."
);