﻿var Import = new function () {

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
                        $siteContent.trigger('ContentAdded');
                    });
                return false;
            }
            if (innerAction.Equals('Site', 'Remove')) {
                $.post($form.attr('action'), $form.serialize() + '&' + innerAction.Serialize(),
                    function (response) {
                        var $sitesContainer = $button.closest('.Sites');
                        var $sitesContent = $(response);
                        $sitesContainer.replaceWith($sitesContent);
                        $sitesContent.trigger('ContentAdded');
                    });
                return false;
            }
            if (innerAction.Equals('Trip', 'Add')) {
                $.post($form.attr('action'), $form.serialize() + '&' + innerAction.Serialize(),
                    function (response) {
                        var $sitesContainer = $button.closest('.Sites');
                        if ($sitesContainer.find('.Site').length > 1) {
                            var $lastSite = $sitesContainer.find('.Site').last();
                            var $siteContent = $(response);
                            $lastSite.after($siteContent);
                            $siteContent.trigger('ContentAdded');
                        } else {
                            var $sitesContent = $(response);
                            $sitesContainer.replaceWith($sitesContent);
                            $sitesContent.trigger('ContentAdded');
                        }
                    });
                return false;
            }
        });

        $('.Site .Coordinates input[type=text], .Subsite .Coordinates input[type=text]').live('change', function () {
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
                                    if (results[0].address_components[i].types[j] == 'country') { country = results[0].address_components[i].long_name; }
                                }
                            }
                            if (county != null) {
                                var $countyContainer = $coordinateContainer.closest('.Site, .Subsite').find('.County input[type=text]');
                                $countyContainer.val(county);
                            }
                            if (state != null && country != null) {
                                var stateText = state + ', ' + country;
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

        $('.Site, .Subsite').live('ContentAdded', function () {
            $(this).find('.CoordinatePicker').not('.Initialized').addClass('Initialized').CoordinatePicker({
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
        }).trigger('ContentAdded');
    }

    return public;
};