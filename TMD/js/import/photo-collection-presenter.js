function PhotoCollectionPresenter($element) {
    this.$element = $element;

    var that = this;
    this.photoPresenters = Enumerable.From($element.find('[data-photo]'))
      .Select(function (e) { return new PhotoPresenter($(e), that); })
      .ToArray();
}

PhotoCollectionPresenter.prototype = {
    _suppressDrag: function (event) {
        event.preventDefault();
    },
    _handleUpload: function (files) {
        var that = this;

        Enumerable.From(files)
          .ForEach(function (file) {
              var presenter = that.getPhotoPresenter(file.name);
              if (!presenter || !presenter.getCanUpload()) return;

              presenter.upload(file);
          });
    },
    _handleDrop: function (event) {
        event.preventDefault();

        this._handleUpload(event.originalEvent.dataTransfer.files)
    },
    _handleInput: function (event) {
        event.preventDefault();

        this._handleUpload(event.target.files);
    },
    _uploadFile: function (file, options) {
        var $tokenInput = this.$element.find('input[name=__RequestVerificationToken]');
        var $fileInput = this.$element.find('input[type=file]');

        var data = new FormData();
        data.append($tokenInput.attr('name'), $tokenInput.attr('value'));
        data.append($fileInput.attr('name'), file);

        $.ajax({
            type: this.$element.attr('method'),
            url: this.$element.attr('action'),
            data: data,
            processData: false,
            contentType: false,
            xhr: function () {
                var xhr = $.ajaxSettings.xhr();
                xhr.upload.addEventListener('progress', options.progress);
                return xhr;
            },
            complete: options.complete
        })
    },
    _triggerAllUploadsComplete: function () {
        if (!this.getAllUploadsComplete()) return;

        this.$element.trigger('all-uploads-complete', this.$element);
    },

    bind: function () {
        this.$element.bind('dragover dragenter', $.proxy(this._suppressDrag, this));
        this.$element.bind('drop', $.proxy(this._handleDrop, this));
        this.$element.find('input[type=file]').bind('change', $.proxy(this._handleInput, this));
        this.$element.bind('upload-complete', $.proxy(this._triggerAllUploadsComplete, this));
    },
    getPhotoPresenter: function (filename) {
        return Enumerable.From(this.photoPresenters)
          .Where(function (p) { return p.getFilename() === filename })
          .SingleOrDefault();
    },
    getAllUploadsComplete: function () {
        return Enumerable.From(this.photoPresenters)
            .All(function (p) { return p.state.name === 'complete'; });
    }
};