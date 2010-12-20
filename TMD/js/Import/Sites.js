var Import = new function () {

    function InnerAction(expression) {
        var parts = expression.split('.');
        this.Level = parts[0];
        this.Id = parts[1];
        this.Action = parts[2];
        this.Equals = function (level, action) {
            return level == this.Level & action == this.Action;
        }
        this.Serialize = function () {
            return 'innerAction=' + this.Level + '.' + this.Id + '.' + this.Action;
        }
    }

    var public = {};

    public.Init = function () {
        $('button[type=submit][name=innerAction]').live('click', function (event) {
            var button = $(this);
            var form = button.closest('form');
            var innerAction = new InnerAction(button.attr('value'));
            if (innerAction.Equals('Site', 'Edit')) {
                $.post(form.attr('action'), form.serialize() + '&' + innerAction.Serialize(),
                    function (response) {
                        var siteContainer = button.closest('.Site');
                        siteContainer.replaceWith(response);
                    });
                return false;
            }
            if (innerAction.Equals('Site', 'Save')) {
                $.post(form.attr('action'), form.serialize() + '&' + innerAction.Serialize(),
                    function (response) {
                        var siteContainer = button.closest('.Site');
                        siteContainer.replaceWith(response);
                    });
                return false;
            }
            if (innerAction.Equals('Site', 'Remove')) {
                $.post(form.attr('action'), form.serialize() + '&' + innerAction.Serialize(),
                    function (response) {
                        if (response.Success) {
                            var siteContainer = button.closest('.Site');
                            siteContainer.remove();
                            if (!response.RemainingSitesSaveableAndRemovable) {
                                $('.Site button[type=submit].Save').remove();
                                $('.Site button[type=submit].Remove').remove();
                            }
                        }
                    });
                return false;
            }
            if (innerAction.Equals('Trip', 'Add')) {
                $.post(form.attr('action'), form.serialize() + '&' + innerAction.Serialize(),
                    function (response) {
                        var sitesContainer = button.closest('.Sites');
                        var lastSite = sitesContainer.find('.Site').last();
                        lastSite.after(response);
                    });
                return false;
            }
            if (innerAction.Equals('Subsite', 'Remove')) {
                //TODO
            }
        });
    }

    return public;
};
