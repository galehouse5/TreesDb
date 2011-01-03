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
            if (innerAction.Equals('Tree', 'Save')
                || innerAction.Equals('Tree', 'Edit')) {
                $.post(form.attr('action'), form.serialize() + '&' + innerAction.Serialize(),
                    function (response) {
                        var treeContainer = button.closest('.Tree');
                        var treeContent = $(response);
                        treeContainer.replaceWith(treeContent);
                        treeContent.trigger('ContentAdded');
                    });
                return false;
            }
            if (innerAction.Equals('Subsite', 'Add')) {
                $.post(form.attr('action'), form.serialize() + '&' + innerAction.Serialize(),
                    function (response) {
                        var subsiteContainer = button.closest('.Subsite');
                        if (subsiteContainer.find('.Tree').length > 1) {
                            var lastTree = subsiteContainer.find('.Tree').last();
                            var treeContent = $(response);
                            lastTree.after(treeContent);
                            treeContent.trigger('ContentAdded');
                        } else {
                            var subsiteContent = $(response);
                            subsiteContainer.replaceWith(subsiteContent);
                            subsiteContent.trigger('ContentAdded');
                        }
                    });
                return false;
            }
            if (innerAction.Equals('Tree', 'Remove')) {
                $.post(form.attr('action'), form.serialize() + '&' + innerAction.Serialize(),
                    function (response) {
                        var subsiteContainer = button.closest('.Subsite');
                        var subsiteContent = $(response);
                        subsiteContainer.replaceWith(subsiteContent);
                        subsiteContent.trigger('ContentAdded');
                    });
                return false;
            }
        });

        $('.Tree').live('ContentAdded', function () {

            $(this).find('.gallery').not('.Initialized').addClass('Initialized').PhotoGallery();

            $(this).find('.CoordinatePicker').not('.Initialized').addClass('Initialized').CoordinatePicker();

            $(this).find('.CommonName input[type=text]').not('.Initialized').addClass('Initialized')
                .autocomplete({ source: "/Trees/FindKnownTreesWithSimilarCommonName", minLength: 2,
                    select: function (event, ui) {
                        var $scientificNameContainer = $(this).closest('.Tree').find('.ScientificName input[type=text]');
                        $scientificNameContainer.val(ui.item.ScientificName);
                    }
                });

            $(this).find('.ScientificName input[type=text]').not('.Initialized').addClass('Initialized')
                .autocomplete({ source: "/Trees/FindKnownTreesWithSimilarScientificName", minLength: 2,
                    select: function (event, ui) {
                        var $commonNameContainer = $(this).closest('.Tree').find('.CommonName input[type=text]');
                        $commonNameContainer.val(ui.item.CommonName);
                    }
                });

        }).trigger('ContentAdded');

    }

    return public;
};
