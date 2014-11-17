function PhotoPresenter($element, PhotoCollectionPresenter) {
    this.$element = $element;
    this.PhotoCollectionPresenter = PhotoCollectionPresenter;
    this.state = new InitialPhotoPresenterState(this);
};

PhotoPresenter.prototype = {
    getFilename: function () {
        return this.$element.data('photo');
    },
    getCanUpload: function () {
        return this.state.getCanUpload();
    },
    getCanError: function () {
        return this.state.getCanError();
    },
    getCanComplete: function () {
        return this.state.getCanComplete();
    },
    getUpdateProgress: function () {
        return this.state.getCanUpdateProgress();
    },

    _displayLabel: function (value) {
        this.$element.find('[data-photo-label]').text(value);
    },
    _displayIcon: function (value) {
        this.$element.find('[data-photo-image]').hide();
        this.$element.find('[data-photo-icon]')
            .attr('class', 'glyphicon ' + value)
            .show(); 
    },
    _displayImage: function (url) {
        this.$element.find('[data-photo-icon]').hide();
        this.$element.find('[data-photo-image]')
            .attr('src', url)
            .show();
    },
    _uploadFile: function (file, options) {
        this.PhotoCollectionPresenter._uploadFile(file, options);
    },
    _loadImageUrl: function (file, callback) {
        var reader = new FileReader();

        reader.onload = function () {
            if (reader.result === 'data:') {
                callback(null);
            } else {
                callback(reader.result);
            }
        };
        reader.readAsDataURL(file);
    },
    _triggerUploadComplete: function () {
        this.$element.trigger('upload-complete', this.$element);
    },

    upload: function (file) {
        return this.state.upload(file);
    },
    error: function () {
        return this.state.error();
    },
    complete: function () {
        return this.state.complete();
    },
    updateProgress: function (event) {
        return this.state.updateProgress(event);
    }
};