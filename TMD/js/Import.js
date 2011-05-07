(function ($) {
    $.fn.InitializeSitesUi = function (options) {
        return this.each(function () {

            $(this).find('.gallery')
                .not('.UiSitesInitialized').addClass('UiSitesInitialized').PhotoGallery();

            $(this).find('.CoordinatePicker')
                .not('.UiSitesInitialized').addClass('UiSitesInitialized').CoordinatePicker({
                    AddressCalculator: function () {
                        var $countyContainer = $(this).closest('.Site, .Subsite').find('.County input[type=text]');
                        var $stateContainer = $(this).closest('.Site, .Subsite').find('.State select');
                        if (!$countyContainer.val().IsNullOrWhitespace() && $stateContainer.find('option:selected').length > 0) {
                            return $countyContainer.val() + ' County, ' + $stateContainer.find('option:selected').text();
                        }
                        if ($stateContainer.find('option:selected').length > 0) {
                            return $stateContainer.find('option:selected').text();
                        }
                        return null;
                    }
                });

            $(this).find('.Coordinates input[type=text]')
                .not('.UiSitesInitialized').addClass('UiSitesInitialized').change(function () {
                    var $coordinateContainer = $(this);
                    var coordinates = Coordinates.Parse($coordinateContainer.val());
                    if (coordinates.IsSpecified() && coordinates.IsValid()) {
                        new google.maps.Geocoder().geocode(
                    { latLng: new google.maps.LatLng(coordinates.Latitude().TotalDegrees(), coordinates.Longitude().TotalDegrees()) },
                    function (results, status) {
                        if (status == google.maps.GeocoderStatus.OK) {
                            var county, state, country;
                            for (i in results[0].address_components) {
                                for (j in results[0].address_components[i].types) {
                                    if (results[0].address_components[i].types[j] == 'administrative_area_level_2') { county = results[0].address_components[i].long_name; }
                                    if (results[0].address_components[i].types[j] == 'administrative_area_level_1') { state = results[0].address_components[i].long_name; }
                                    if (results[0].address_components[i].types[j] == 'country') { country = results[0].address_components[i].short_name; }
                                }
                            }
                            if (county != null) {
                                var $countyContainer = $coordinateContainer.closest('.Site, .Subsite').find('.County input[type=text]');
                                $countyContainer.val(county);
                            }
                            if (state != null && country != null) {
                                var stateText = state + ' (' + country + ')';
                                var $stateContainer = $coordinateContainer.closest('.Site, .Subsite').find('.State select');
                                var $stateOption = $stateContainer.find('option').filter(function () { return $(this).text() == stateText });
                                if ($stateOption != null) {
                                    $stateContainer.find('option').removeAttr('selected');
                                    $stateOption.attr('selected', 'selected');
                                    $.uniform.update($stateContainer);
                                }
                            }
                        }
                    });
                    }
                });

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

            $(this).find('button[type=submit][name=innerAction]')
                .not('.UiSitesInitialized').addClass('UiSitesInitialized').click(function (event) {
                    var $button = $(this);
                    var $form = $button.closest('form');
                    var innerAction = new InnerAction($button.attr('value'));
                    if (innerAction.Equals('Site', 'Save')
                        || innerAction.Equals('Site', 'Edit')
                        || innerAction.Equals('Site', 'Add')
                        || innerAction.Equals('Subsite', 'Remove')) {
                        $.post($form.attr('action'), $form.serialize() + '&' + innerAction.Serialize(),
                        function (response) {
                            var $siteContainer = $button.closest('.Site');
                            var $siteContent = $(response);
                            $siteContainer.replaceWith($siteContent);
                            $siteContent.InitializeUi().InitializeSitesUi();
                            if (innerAction.Equals('Site', 'Save') || innerAction.Equals('Site', 'Edit')) { $siteContent.SmoothScrollInFocus(); }
                            if (innerAction.Equals('Site', 'Add')  || innerAction.Equals('Subsite', 'Remove')) { $siteContent.find('.Subsite:last').SmoothScrollInFocus(); }
                        });
                        return false;
                    }
                    if (innerAction.Equals('Site', 'Remove')) {
                        $.post($form.attr('action'), $form.serialize() + '&' + innerAction.Serialize(),
                        function (response) {
                            var $sitesContainer = $button.closest('.Sites');
                            var $sitesContent = $(response);
                            $sitesContainer.replaceWith($sitesContent);
                            $sitesContent.InitializeUi().InitializeSitesUi().find('.Site:last').SmoothScrollInFocus();
                        });
                        return false;
                    }
                    if (innerAction.Equals('Trip', 'Add')) {
                        $.post($form.attr('action'), $form.serialize() + '&' + innerAction.Serialize(),
                        function (response) {
                            var $sitesContainer = $button.closest('.Sites');
                            if ($sitesContainer.find('.Site').length > 1) {
                                var $lastSite = $sitesContainer.find('.Site:last');
                                var $siteContent = $(response);
                                $lastSite.after($siteContent);
                                $siteContent.InitializeUi().InitializeSitesUi().SmoothScrollInFocus();
                            } else {
                                var $sitesContent = $(response);
                                $sitesContainer.replaceWith($sitesContent);
                                $sitesContent.InitializeUi().InitializeSitesUi().find('.Site:last').SmoothScrollInFocus();
                            }
                        });
                        return false;
                    }
                });

        });
    }
})(jQuery);
(function ($) {
    $.fn.InitializeTreesUi = function (options) {
        return this.each(function () {

            $(this).find('.gallery')
                .not('.UiTreesInitialized').addClass('UiTreesInitialized').PhotoGallery();

            $(this).find('.CoordinatePicker')
                .not('.UiTreesInitialized').addClass('UiTreesInitialized').CoordinatePicker();

            $(this).find('.CommonName input[type=text]')
                .not('.UiTreesInitialized').addClass('UiTreesInitialized')
                .autocomplete({ source: "/Trees/FindKnownSpeciesWithSimilarCommonName", minLength: 2,
                    select: function (event, ui) {
                        var $scientificNameContainer = $(this).closest('.Tree').find('.ScientificName input[type=text]');
                        $scientificNameContainer.val(ui.item.ScientificName);
                    }
                });

            $(this).find('.ScientificName input[type=text]')
                .not('.UiTreesInitialized').addClass('UiTreesInitialized')
                .autocomplete({ source: "/Trees/FindKnownSpeciesWithSimilarScientificName", minLength: 2,
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
                    return level == this.Level & action == this.Action;
                }
                this.Serialize = function () {
                    return 'innerAction=' + this.Level + '.' + this.Id + '.' + this.Action;
                }
            }

            $(this).find('button[type=submit][name=innerAction]')
                .not('.UiTreesInitialized').addClass('UiTreesInitialized').click(function (event) {
                    var $button = $(this);
                    var $form = $button.closest('form');
                    var innerAction = new InnerAction($button.attr('value'));
                    if (innerAction.Equals('Tree', 'Save')
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
                    if (innerAction.Equals('Subsite', 'Add')) {
                        $.post($form.attr('action'), $form.serialize() + '&' + innerAction.Serialize(),
                        function (response) {
                            var $subsiteContainer = $button.closest('.Subsite');
                            if ($subsiteContainer.find('.Tree').length > 1) {
                                var $lastTree = $subsiteContainer.find('.Tree:last');
                                var $treeContent = $(response);
                                $lastTree.after($treeContent);
                                $treeContent.InitializeUi().InitializeTreesUi().SmoothScrollInFocus();
                            } else {
                                var $subsiteContent = $(response);
                                $subsiteContainer.replaceWith($subsiteContent);
                                $subsiteContent.InitializeUi().InitializeTreesUi().find('.Tree:last').SmoothScrollInFocus();
                            }
                        });
                        return false;
                    }
                    if (innerAction.Equals('Tree', 'Remove')) {
                        $.post($form.attr('action'), $form.serialize() + '&' + innerAction.Serialize(),
                        function (response) {
                            var $subsiteContainer = $button.closest('.Subsite');
                            var $subsiteContent = $(response);
                            $subsiteContainer.replaceWith($subsiteContent);
                            $subsiteContent.InitializeUi().InitializeTreesUi().find('.Tree:last').SmoothScrollInFocus();
                        });
                        return false;
                    }
                });

        });
    }
})(jQuery);

