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
            if (innerAction.Equals('Site', 'Save')
                || innerAction.Equals('Site', 'Edit')
                || innerAction.Equals('Site', 'Add')
                || innerAction.Equals('Subsite', 'Remove')) {
                $.post(form.attr('action'), form.serialize() + '&' + innerAction.Serialize(),
                    function (response) {
                        var siteContainer = button.closest('.Site');
                        var siteContent = $(response);
                        siteContainer.replaceWith(siteContent);
                        siteContent.trigger('ContentAdded');
                    });
                return false;
            }
            if (innerAction.Equals('Site', 'Remove')) {
                $.post(form.attr('action'), form.serialize() + '&' + innerAction.Serialize(),
                    function (response) {
                        var sitesContainer = button.closest('.Sites');
                        var sitesContent = $(response);
                        sitesContainer.replaceWith(sitesContent);
                        sites.trigger('ContentAdded');
                    });
                return false;
            }
            if (innerAction.Equals('Trip', 'Add')) {
                $.post(form.attr('action'), form.serialize() + '&' + innerAction.Serialize(),
                    function (response) {
                        var sitesContainer = button.closest('.Sites');
                        if (sitesContainer.find('.Site').length > 1) {
                            var lastSite = sitesContainer.find('.Site').last();
                            var siteContent = $(response);
                            lastSite.after(siteContent);
                            siteContent.trigger('ContentAdded');
                        } else {
                            var sitesContent = $(response);
                            sitesContainer.replaceWith(sitesContent);
                            sitesContent.trigger('ContentAdded');
                        }
                    });
                return false;
            }
        });
    }

    return public;
};
