/**
 * Colis - ling
 * ===============================
 * 2016-01-08 - LingTalfi
 *
 * I'm using typeahead for the selector (https://github.com/twitter/typeahead.js),
 * pluploader 2.1.8 for the uploader (http://www.plupload.com/),
 *
 * the preview is self made.
 *
 *
 *
 * In this implementation, pluploader is used to upload one single file.
 *
 *
 * By default:
 * There is a browse button, and it also uses a dropzone.
 *
 * When the file is queued, it is automatically uploaded (autostart).
 * It uses chunking technique.
 * The file name and size are displayed, and there is also a progress bar and a percentage number that appear,
 * all of this inside the dropzone.
 *
 * While a file is being uploaded, a stop button appears (below the progress bar), which disappear when the
 * upload is complete or canceled.
 * If the user clicks the stop button while it's uploading, the stop button disappear and
 * two other buttons appear: remove and resume (thanks to chunking).
 *
 * If the user clicks the remove button, the dropzone (where all buttons reside) is refreshed, which means it
 * gets empty again.
 * After a successful upload however, the name of the file remains
 *
 *
 *
 *
 */
(function () {
    if ('undefined' !== typeof window.colis) {
        var uploader = window.colisClasses.uploader;
        var selector = window.colisClasses.selector;
        var preview = window.colisClasses.preview;
        var colis = window.colis;


        /**
         * dictionnary
         */
        window.colisDictionnary = function () {
        };
        window.colisDictionnary.prototype = {
            load: function () {
                this.values = {
                    'Refresh': 'Refresh',
                    'Halt': 'Halt',
                    'Resume': 'Resume',
                    'Remove': 'Remove',
                    'Drop files here to upload': 'Drop files here to upload',
                    'Browse': 'Browse',
                    'Duration': 'Duration',
                    'Title': 'Title',
                    'Description': 'Description',
                    'Unknown': 'Unknown'
                };
            }
        };

        //------------------------------------------------------------------------------/
        // GLOBAL SOUP
        //------------------------------------------------------------------------------/
        var oDict = new window.colisDictionnary();
        var _ = function (m) {
            return oDict.values[m];
        };
        var jWrapper = null; // contains the whole wrapper (see html structure)

        function formatDuration(duration) {
            if('' === duration){
                return _("Unknown");
            }
            var sec_num = parseInt(duration, 10);
            var hours = Math.floor(sec_num / 3600);
            var minutes = Math.floor((sec_num - (hours * 3600)) / 60);
            var seconds = sec_num - (hours * 3600) - (minutes * 60);

            if (hours < 10) {
                hours = "0" + hours;
            }
            if (minutes < 10) {
                minutes = "0" + minutes;
            }
            if (seconds < 10) {
                seconds = "0" + seconds;
            }
            var time = hours + ':' + minutes + ':' + seconds;
            return time + 's';
        }
        
        function encodeUrl(url){
            var p = url.split('/');
            var lastComponent = p.pop();
            return p.join('/') + '/' + encodeURIComponent(lastComponent);
        }


        //------------------------------------------------------------------------------/
        // SELECTOR - TYPEAHEAD
        //------------------------------------------------------------------------------/
        selector.prototype.buildTemplate = function (jInput) {
            jInput.addClass("typeahead");
            this.jUpdator = $('<button class="colis_selector_updator">' + _("Refresh") + '</button>');
            jInput.after(this.jUpdator);
        };


        selector.prototype.build = function (oColis, conf) {

            var zis = this;

            this.items = conf.items; // items must exist, should have checked it probably...
            var substringMatcher = function () {
                return function findMatches(q, cb) {
                    var matches, substrRegex;
                    matches = [];
                    substrRegex = new RegExp(jGoodies.regexQuote(q), 'i');
                    $.each(zis.items, function (i, str) {
                        if (substrRegex.test(str)) {
                            matches.push(str);
                        }
                    });
                    cb(matches);
                };
            };


            var jInput = oColis.get('jInput');

            this.buildTemplate(jInput); // builds jUpdator

            var options = $.extend({
                hint: true,
                highlight: true,
                minLength: 1
            }, conf.options);
            var datasets = $.extend({
                name: 'myDataset',
                limit: 100,
                source: substringMatcher()
            }, conf.options);

            jInput.typeahead(options, datasets);
            jInput.bind('typeahead:select', function (ev, suggestion) {
                oColis.onItemSelected(suggestion);
            });


            this.jInput = jInput;

            jInput.on('paste', function () {
                var zis = this;
                setTimeout(function () {
                    oColis.onItemSelected(jInput.val());
                }, 100);
            });

            this.jUpdator.on('click', function () {
                oColis.onItemSelected(jInput.val());
                return false;
            });


        };

        selector.prototype.appendItem = function (name) {
            this.items.push(name);
        };

        selector.prototype.setValue = function (name) {
            this.jInput.typeahead('val', name);
        };


        //------------------------------------------------------------------------------/
        // PREVIEW - POLAROID/info list
        //------------------------------------------------------------------------------/
        preview.prototype.buildTemplate = function (jWrapper) {
            jWrapper.append('<div class="colis_preview"><ul class="colis_polaroids"></ul></div>');
            this.jPreview = jWrapper.find('.colis_preview');
        };
        preview.prototype.build = function (oColis, conf) {

            this.buildTemplate(jWrapper); // builds jPreview

            var options = $.extend({
                // required
                jPreview: this.jPreview,
                /**
                 * Handler know how to display the info coming from the server.
                 * This implementation expects that the info map contains at least a "type" key which value
                 * is something like "image", or "video".
                 *
                 * The info looks like this:
                 *
                 * - info:
                 * ----- type: image
                 * ----- src: /absolute/url/to/image.jpg  (possibly starting with http://)
                 *
                 *
                 *
                 */
                handlers: {
                    image: function (info, jPreview) {
                        var url = info.src;
                        jPreview.find(".colis_polaroids").empty().append('<li><a href="' + url + '" target="_blank' +
                        '"><img src="' + url + '" alt="' + url + '"></a></li>');
                    },
                    video: function (info, jPreview) {
                        var url = info.src;
                        var duration = info.duration;

                        jPreview.find(".colis_polaroids").empty().append('<li>' +
                        '<video width="100" controls>' +
                        '<source src="' + encodeUrl(url) + '" type="video/mp4">' +
                        'Your browser does not support the video tag.' +
                        '</video>' +
                        '<div class="colis_preview_additional_info">' +
                        '<div class="inner"><ul>' +
                        '<li>' + _("Duration") + ': ' + formatDuration(duration) + '</li>' +
                        '</ul></div>' +
                        '</div>' +
                        '</li>');
                    },
                    youtube: function (info, jPreview) {
                        jPreview.find(".colis_polaroids").empty().append('<li>' +
                        info.iframe +
                        '<div class="colis_preview_additional_info">' +
                        '<div class="inner"><ul>' +
                        '<li>' + _("Title") + ': ' + info.title + '</li>' +
                        '<li>' + _("Description") + ': ' + info.description + '</li>' +
                        '<li>' + _("Duration") + ': ' + formatDuration(info.duration) + '</li>' +
                        '</ul></div>' +
                        '</div>' +
                        '</li>');
                        //jPreview.find('iframe').attr("width", "30%");
                    },
                    none: function (info, jPreview) {
                        jPreview.find(".colis_polaroids").empty();
                    }

                }
            }, conf);


            this.get = function (k) {
                if (k in options) {
                    return options[k];
                }
                throw new Error("Invalid key: " + k);
            };


            if (!options.jPreview instanceof jQuery) {
                oColis.error("Invalid jInput");
            }


        };

        preview.prototype.display = function (info) {
            this.get('handlers')[info.type](info, this.get('jPreview'));
        };

        //------------------------------------------------------------------------------/
        // UPLOADER
        //------------------------------------------------------------------------------/
        uploader.prototype.buildTemplate = function (jWrapper) {
            var jDropZone = $(
                '<div class="colis_dropzone">' +
                    //
                '<div class="colis_dropzone_message">' +
                '<span class="colis_filename"></span>' +
                '&nbsp;&nbsp;' +
                '<span class="colis_percent"></span>' +
                '</div>' +
                    //
                '<progress class="colis_progress" max="100" value="0"></progress>' +
                    //
                '<div class="colis_dropzone_message">' +
                '<button class="colis_cancel_upload">' + _("Halt") + '</button>' +
                '<button class="colis_resume_upload">' + _("Resume") + '</button>' +
                '<button class="colis_remove_upload">' + _("Remove") + '</button>' +
                '</div>' +
                    //
                '<div class="colis_dropzone_message">' + _("Drop files here to upload") + '</div>' +
                    //
                '</div>'
            );
            jWrapper.append(jDropZone);
            jWrapper.append('<div class="colis_browse_container">' +
            '<button class="colis_browse">' + _("Browse") + '</button>' +
            '</div>');

            this.jDropZone = jDropZone;
            this.jBrowse = $('.colis_browse', jWrapper);

        };
        uploader.prototype.build = function (oColis, conf) {


            this.buildTemplate(jWrapper);  // builds jDropZone and jBrowse


            var zis = this;
            var options = $.extend({
                //------------------------------------------------------------------------------/
                // THIS IMPLEMENTATION'S SPECIFIC OPTIONS
                //------------------------------------------------------------------------------/
                jDropZone: this.jDropZone, // required

                //------------------------------------------------------------------------------/
                // PLUPLOAD OPTIONS
                //------------------------------------------------------------------------------/
                browse_button: this.jBrowse[0],
                url: '/libs/colis/service/colis_upload.php',
                filters: {
                    // Specify what files to browse for
                    mime_types: [
                        {title: "Image files", extensions: "jpg,gif,png,mts,avi,psd,mp4"},
                        {title: "Zip files", extensions: "zip"}
                    ],
                    // Maximum file size
                    max_file_size: '2000mb'
                },
                chunk_size: '1mb',
                unique_names: false,
                drop_element: this.jDropZone[0]
            }, conf);


            if (null !== options.jDropZone) {


                var jDropZone = options.jDropZone;
                this.buildComponents(jDropZone);
                var plup = new plupload.Uploader(options);

                plup.init();
                var currentFileId = null;
                this.refreshView();

                plup.bind('BeforeUpload', function (up, file) {
                    currentFileId = file.id;
                });
                plup.bind('FilesAdded', function (up, files) {

                    plupload.each(files, function (file) {
                        zis.jFileName.html(file.name);
                    });

                    zis.onUploadBefore();
                    plup.start();
                });
                plup.bind('FileUploaded', function (up, file, response) {
                    var serverResponse = JSON.parse(response.response);
                    timProcessResponse(serverResponse, function (nameAndInfo) {
                        oColis.onItemUploaded(nameAndInfo);
                        zis.jCancelButton.hide();
                    }, function (m) {
                        oColis.get('onRequestError')(m); // re-using same "tim error handling logic" as in colis.js
                    });

                });
                plup.bind('UploadProgress', function (up, file) {
                    zis.uploadProgress(file.percent);
                });

                plup.bind('Error', function (up, err) {
                    oColis.error('plupload: ' + err.message);
                });


                this.jCancelButton.on('click.ling', function () {
                    plup.stop();
                    zis.jRemoveButton.show();
                    zis.jResumeButton.show();
                    zis.jCancelButton.hide();
                    return false;
                });

                this.jResumeButton.on('click.ling', function () {
                    plup.start();
                    zis.jRemoveButton.hide();
                    zis.jResumeButton.hide();
                    zis.jCancelButton.show();
                    return false;
                });

                this.jRemoveButton.on('click.ling', function () {
                    plup.stop();
                    plup.removeFile(currentFileId);
                    zis.refreshView();
                    return false;
                });

            }
            else {
                oColis.error("colis-ling uploader: undefined jDropZone");
            }
        };

        uploader.prototype.buildComponents = function (jDropZone) {
            this.jProgress = $('.colis_progress', jDropZone);
            this.jFileName = $('.colis_filename', jDropZone);
            this.jPercent = $('.colis_percent', jDropZone);
            this.jCancelButton = $('.colis_cancel_upload', jDropZone);
            this.jResumeButton = $('.colis_resume_upload', jDropZone);
            this.jRemoveButton = $('.colis_remove_upload', jDropZone);
        };

        uploader.prototype.uploadProgress = function (percent) {
            this.jProgress.attr('value', percent);
            this.jPercent.html('(' + percent + '%)');
        };

        uploader.prototype.refreshView = function () {
            this.jProgress.hide();
            this.jFileName.hide();
            this.jPercent.hide();
            this.jCancelButton.hide();
            this.jResumeButton.hide();
            this.jRemoveButton.hide();
            this.uploadProgress(0);
        };

        uploader.prototype.onUploadBefore = function () {

            this.uploadProgress(0);
            this.jProgress.show();
            this.jFileName.show();
            this.jPercent.show();
            this.jCancelButton.show();
            this.jResumeButton.hide();
            this.jRemoveButton.hide();
        };


        //------------------------------------------------------------------------------/
        // COLIS
        //------------------------------------------------------------------------------/
        colis.prototype.buildTemplate = function (jInput) {
            jInput.wrap('<div class="colis_wrapper"><div class="colis_selector_wrapper"></div></div>');
            jWrapper = jInput.parent().parent();
        };
        colis.prototype.build = function () {

            oDict.load(); // lazy dict loading

            var conf = this.getConf();
            // first build yourself, THEN build the helpers...
            this.buildTemplate(conf.jInput);
            this.getSelector().build(this, conf.selector);
            this.getPreview().build(this, conf.preview);
            this.getUploader().build(this, conf.uploader);
        };

    }
})();