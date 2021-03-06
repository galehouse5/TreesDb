﻿(function ($) {
    $.fn.InitializeSitesUi = function (options) {
        return this.each(function () {

            $(this).find('.gallery')
                .not('.UiSitesInitialized').addClass('UiSitesInitialized').PhotoGallery();

            $(this).find('.CoordinatePicker')
                .not('.UiSitesInitialized').addClass('UiSitesInitialized').CoordinatePicker({
                    AddressCalculator: function () {
                        var $countyContainer = $(this).closest('.Site,').find('.County input[type=text]');
                        var $stateContainer = $(this).closest('.Site').find('.State select');
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
                        if (status === google.maps.GeocoderStatus.OK) {
                            var address_components = results[0].address_components;
                            var county, state, country;
                            for (i in address_components) {
                                var address_component = address_components[i];
                                for (j in address_component.types) {
                                    var type = address_component.types[j];
                                    if (type === 'administrative_area_level_2') { county = address_component.long_name.replace(/ County$/i, ''); }
                                    if (type === 'administrative_area_level_1') { state = address_component.long_name; }
                                    if (type === 'country') { country = address_component.short_name; }
                                }
                            }
                            if (county !== null) {
                                var $countyContainer = $coordinateContainer.closest('.Site').find('.County input[type=text]');
                                $countyContainer.val(county);
                            }
                            if (state !== null && country !== null) {
                                var stateText = state + ' (' + country + ')';
                                var $stateContainer = $coordinateContainer.closest('.Site').find('.State select');
                                var $stateOption = $stateContainer.find('option').filter(function () { return $(this).text() === stateText; });
                                if ($stateOption !== null) {
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
                    return level === this.Level & action === this.Action;
                };
                this.Serialize = function () {
                    return 'innerAction=' + this.Level + '.' + this.Id + '.' + this.Action;
                };
            }

            $(this).find('button[type=submit][name=innerAction]')
                .not('.UiSitesInitialized').addClass('UiSitesInitialized').click(function (event) {
                    var $button = $(this);
                    var $form = $button.closest('form');
                    var innerAction = new InnerAction($button.attr('value'));
                    if (innerAction.Equals('Site', 'Save')
                        || innerAction.Equals('Site', 'Edit')
                        || innerAction.Equals('Site', 'Add')) {
                        $.post($form.attr('action'), $form.serialize() + '&' + innerAction.Serialize(),
                        function (response) {
                            var $siteContainer = $button.closest('.Site');
                            var $siteContent = $(response);
                            $siteContainer.replaceWith($siteContent);
                            $siteContent.InitializeUi().InitializeSitesUi();
                            if (innerAction.Equals('Site', 'Save') || innerAction.Equals('Site', 'Edit')) { $siteContent.SmoothScrollInFocus(); }
                            if (innerAction.Equals('Site', 'Add')) { $siteContent.find('.Site:last').SmoothScrollInFocus(); }
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
    };
})(jQuery);