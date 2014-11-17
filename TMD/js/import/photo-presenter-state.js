function PhotoPresenterState(name, photoPresenter) {
    this.name = name;
    this.photoPresenter = photoPresenter;
};

PhotoPresenterState.prototype = {
    getCanUpload: function () { return false; },
    getCanError: function () { return false; },
    getCanComplete: function () { return false; },
    getCanUpdateProgress: function () { return false; },

    upload: function (file) {
        throw 'unable to upload a photo in the "' + this.name + '" state';
    },
    error: function () {
        throw 'unable to error a photo in the "' + this.name + '" state';
    },
    complete: function () {
        throw 'unable to complete a photo in the "' + this.name + '" state';
    },
    updateProgress: function (event) {
        throw 'unable to update progress for a photo in the "' + this.name + '" state';
    }
};


function InitialPhotoPresenterState(photoPresenter) {
    PhotoPresenterState.call(this, 'initial', photoPresenter);
};

InitialPhotoPresenterState.prototype = $.extend({}, PhotoPresenterState.prototype, {
    getCanUpload: function () { return true; },

    upload: function (file) {
        var presenter = this.photoPresenter;

        presenter._loadImageUrl(file, function (url) {
            // file is not a valid image
            if (!url) return;

            presenter._displayImage(url);

            presenter._uploadFile(file, {
                complete: function (_, status) {
                    if (status === 'success') {
                        presenter.complete();
                    } else {
                        presenter.error();
                    }
                },
                progress: function (context) {
                    presenter.updateProgress(context);
                }
            });

            presenter.state = new UploadingPhotoPresenterState(presenter);
        });
    }
});


function UploadingPhotoPresenterState(photoPresenter) {
    PhotoPresenterState.call(this, 'uploading', photoPresenter);
};

UploadingPhotoPresenterState.prototype = $.extend({}, PhotoPresenterState.prototype, {
    getCanError: function () { return true; },
    getCanComplete: function () { return true; },
    getCanUpdateProgress: function () { return true; },

    error: function () {
        this.photoPresenter.state = new ErrorPhotoPresenterState(this.photoPresenter);
        this.photoPresenter.error();
    },
    complete: function () {
        this.photoPresenter.state = new CompletePhotoPresenterState(this.photoPresenter);
        this.photoPresenter.complete();
    },
    updateProgress: function (event) {
        var percentage = Math.round(event.loaded / event.total * 100);
        this.photoPresenter._displayLabel(percentage + '%')
    }
});


function ErrorPhotoPresenterState(photoPresenter) {
    PhotoPresenterState.call(this, 'error', photoPresenter);
};

ErrorPhotoPresenterState.prototype = $.extend({}, PhotoPresenterState.prototype, {
    getCanUpload: function () { return true; },
    getCanError: function () { return true; },

    upload: function (file) {
        this.photoPresenter._displayIcon('glyphicon-question-sign');
        this.photoPresenter.state = new InitialPhotoPresenterState(this.photoPresenter);
        this.photoPresenter.upload(file);
    },
    error: function () {
        this.photoPresenter._displayIcon('glyphicon-remove-sign');
        this.photoPresenter._displayLabel(this.photoPresenter.getFilename());
    }
});


function CompletePhotoPresenterState(photoPresenter) {
    PhotoPresenterState.call(this, 'complete', photoPresenter);
};

CompletePhotoPresenterState.prototype = $.extend({}, PhotoPresenterState.prototype, {
    getCanComplete: function () { return true; },

    complete: function () {
        this.photoPresenter._displayLabel(this.photoPresenter.getFilename());
        this.photoPresenter._triggerUploadComplete();
    }
});