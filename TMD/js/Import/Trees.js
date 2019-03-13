(function ($) {
    $.fn.InitializeTreesUi = function (options) {
        return this.each(function () {

            $(this).find('.gallery')
                .not('.UiTreesInitialized').addClass('UiTreesInitialized').PhotoGallery();

            $(this).find('.CoordinatePicker')
                .not('.UiTreesInitialized').addClass('UiTreesInitialized').CoordinatePicker();

            $(this).find('.CommonName input[type=text]')
                .not('.UiTreesInitialized').addClass('UiTreesInitialized')
                .autocomplete({ source: applicationRootUrl + "/Trees/FindKnownSpeciesWithSimilarCommonName", minLength: 2,
                    select: function (event, ui) {
                        var $scientificNameContainer = $(this).closest('.Tree').find('.ScientificName input[type=text]');
                        $scientificNameContainer.val(ui.item.ScientificName);
                    }
                });

            $(this).find('.ScientificName input[type=text]')
                .not('.UiTreesInitialized').addClass('UiTreesInitialized')
                .autocomplete({ source: applicationRootUrl + "/Trees/FindKnownSpeciesWithSimilarScientificName", minLength: 2,
                    select: function (event, ui) {
                        var $commonNameContainer = $(this).closest('.Tree').find('.CommonName input[type=text]');
                        $commonNameContainer.val(ui.item.CommonName);
                    }
                });

            function InnerAction(expression) {
                var parts = expression.split('.');
                this.Level = parts[0];
                this.Id = parts[1];
                this.Action = parts[2];
                this.Equals = function (level, action) {
                    return level === this.Level && action === this.Action;
                };
                this.Serialize = function () {
                    return 'innerAction=' + this.Level + '.' + this.Id + '.' + this.Action;
                };
            }

            $(this).find('button[type=submit][name=innerAction]')
                .not('.UiTreesInitialized').addClass('UiTreesInitialized').click(function (event) {
                    var $button = $(this);
                    var $form = $button.closest('form');
                    var innerAction = new InnerAction($button.attr('value'));
                    if (innerAction.Equals('Tree', 'SaveUnlessOptionalErrors')
                        || innerAction.Equals('Tree', 'SaveIgnoringOptionalErrors')
                        || innerAction.Equals('Tree', 'Edit')) {
                        $.post($form.attr('action'), $form.serialize() + '&' + innerAction.Serialize(),
                        function (response) {
                            var $treeContainer = $button.closest('.Tree');
                            var $treeContent = $(response);
                            $treeContainer.replaceWith($treeContent);
                            $treeContent.InitializeUi().InitializeTreesUi().SmoothScrollInFocus();
                        });
                        return false;
                    }
                    if (innerAction.Equals('Site', 'Add')) {
                        $.post($form.attr('action'), $form.serialize() + '&' + innerAction.Serialize(),
                        function (response) {
                            var $siteContainer = $button.closest('.Site');
                            if ($siteContainer.find('.Tree').length > 1) {
                                var $lastTree = $siteContainer.find('.Tree:last');
                                var $treeContent = $(response);
                                $lastTree.after($treeContent);
                                $treeContent.InitializeUi().InitializeTreesUi().SmoothScrollInFocus();
                            } else {
                                var $siteContent = $(response);
                                $siteContainer.replaceWith($siteContent);
                                $siteContent.InitializeUi().InitializeTreesUi().find('.Tree:last').SmoothScrollInFocus();
                            }
                        });
                        return false;
                    }
                    if (innerAction.Equals('Tree', 'Remove')) {
                        $.post($form.attr('action'), $form.serialize() + '&' + innerAction.Serialize(),
                        function (response) {
                            var $siteContainer = $button.closest('.Site');
                            var $siteContent = $(response);
                            $siteContainer.replaceWith($siteContent);
                            $siteContent.InitializeUi().InitializeTreesUi().find('.Tree:last').SmoothScrollInFocus();
                        });
                        return false;
                    }
                });

        });
    };
})(jQuery);
